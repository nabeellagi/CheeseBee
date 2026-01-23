import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

const UPDATE_INTERVAL = 50; // 20 Hz is enough
const DEADZONE = 0.03;      // ignore tiny jitter

let lastUpdate = 0;
let handPresent = false;

export function createPointerHandTracker({
    videoEl,
    onGesture,
}) {
    const hands = new Hands({
        locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.6,
    });

    hands.onResults((results) => {
        const now = performance.now();
        if (now - lastUpdate < UPDATE_INTERVAL) return;
        lastUpdate = now;

        if (!results.multiHandLandmarks?.length) {
            if (handPresent) {
                handPresent = false;
                onGesture({ type: "STOP" });
            }
            return;
        }

        handPresent = true;

        const lm = results.multiHandLandmarks[0];

        const mcp = lm[5]; // index base
        const tip = lm[8]; // index tip

        const dx = tip.x - mcp.x;
        const dy = tip.y - mcp.y;

        // ignore jitter
        if (Math.abs(dx) < DEADZONE && Math.abs(dy) < DEADZONE) {
            onGesture({ type: "STOP" });
            return;
        }

        let dirX = "";
        let dirY = "";

        if (dx > DEADZONE) dirX = "LEFT";
        else if (dx < -DEADZONE) dirX = "RIGHT";

        if (dy > DEADZONE) dirY = "DOWN";
        else if (dy < -DEADZONE) dirY = "UP";

        const direction =
            dirX && dirY ? `${dirY}-${dirX}` : dirX || dirY;

        if (direction) {
            onGesture({
                type: "DIRECTION",
                value: direction,
            });
        }
    });

    const camera = new Camera(videoEl, {
        width: 320,
        height: 240,
        onFrame: async () => {
            await hands.send({ image: videoEl });
        },
    });

    camera.start();

    function handleVisibilityChange() {
        if (document.hidden) {
            camera.stop();
            handPresent = false;
            onGesture({ type: "STOP" });
        } else {
            camera.start();
        }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return {
        stop() {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            camera.stop();
        },
    };
}
