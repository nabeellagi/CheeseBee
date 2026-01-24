import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

const UPDATE_INTERVAL = 50; 
const DEADZONE = 0.03;      // ignore tiny jitter

let lastUpdate = 0;
let handPresent = false;

const GRASP_THRESHOLD = 0.4;
let isGrasping = false;

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

        const lm = results.multiHandLandmarks[0];
        if (!handPresent) {
            handPresent = true;
        }

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

        // pALM GRASP DETECTION 
        const wrist = lm[0]; // palm center

        const fingerTips = [
            lm[4],  // thumb
            lm[8],  // index
            lm[12], // middle
            lm[16], // ring
            lm[20], // pinky
        ];

        // average distance from palm to fingertips
        let sum = 0;
        for (const tip of fingerTips) {
            sum += dist(wrist, tip);
        }
        const avgDist = sum / fingerTips.length;

        const palmClosed = avgDist < GRASP_THRESHOLD;

        // ---- DRAG n DROP ----
        if (palmClosed && !isGrasping) {
            isGrasping = true;
            onGesture({ type: "DRAG_START" });
            console.log("start")
        }

        if (!palmClosed && isGrasping) {
            isGrasping = false;
            onGesture({ type: "DRAG_RELEASE" });
            console.log("release")
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
function dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}
