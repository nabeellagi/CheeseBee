import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

const PINCH_THRESHOLD = 0.04;     // normalized distance
const UPDATE_INTERVAL = 100;      // ms (10 Hz)

let lastUpdate = 0;
let pinchActive = false;
let handPresent = false;

export function createHandTracker({
    videoEl,
    onGesture,
}) {
    const hands = new Hands({
        locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 0,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5,

    });

    let clawHoldStart = null;
    let clawTriggered = false;
    const CLAW_HOLD_TIME = 500; // ms


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

        const index = {
            tip: lm[8],
            pip: lm[6],
            mcp: lm[5],
        };

        const thumb = {
            tip: lm[4],
            ip: lm[3],
            mcp: lm[2],
        };

        // how extended the finger is
        const indexExtension = dist(index.tip, index.mcp);
        const thumbExtension = dist(thumb.tip, thumb.mcp);

        // thresholds tuned for low-res n low modelComplexity
        const INDEX_POINTING = indexExtension > 0.10;
        const THUMB_POINTING = thumbExtension > 0.13;


        // ---------- DIRECTION ----------
        let vertical = null;
        let horizontal = null;

        if (INDEX_POINTING && !THUMB_POINTING) {
            vertical = index.tip.y < index.pip.y ? "UP" : "DOWN";
        }

        if (THUMB_POINTING && !INDEX_POINTING) {
            horizontal = thumb.tip.x < thumb.ip.x ? "RIGHT" : "LEFT";
        }

        // diagonal only if BOTH are clearly pointing
        let direction = null;
        if (INDEX_POINTING && THUMB_POINTING) {
            vertical = index.tip.y < index.pip.y ? "UP" : "DOWN";
            horizontal = thumb.tip.x < thumb.ip.x ? "RIGHT" : "LEFT";
            direction = `${vertical}-${horizontal}`;
        } else {
            direction = vertical || horizontal;
        }

        if (direction) {
            onGesture({
                type: "DIRECTION",
                value: direction,
            });
        }

        const handsLm = results.multiHandLandmarks;

        if (handsLm.length === 2) {
            const leftOpen = isPalmOpen(handsLm[0]);
            const rightOpen = isPalmOpen(handsLm[1]);

            if (leftOpen && rightOpen) {
                if (!clawHoldStart) {
                    clawHoldStart = now;
                    clawTriggered = false;
                }

                if (!clawTriggered && now - clawHoldStart >= CLAW_HOLD_TIME) {
                    clawTriggered = true;
                    onGesture({ type: "CLAW_POSE" });
                }
            } else {
                clawHoldStart = null;
                clawTriggered = false;
            }
        } else {
            clawHoldStart = null;
            clawTriggered = false;
        }

        // ---------- PINCH ----------
        // const dx = index.tip.x - thumb.tip.x;
        // const dy = index.tip.y - thumb.tip.y;
        // const pinchDist = Math.sqrt(dx * dx + dy * dy);

        // if (pinchDist < PINCH_THRESHOLD && !pinchActive) {
        //     pinchActive = true;
        //     onGesture({ type: "PINCH_START" });
        // }

        // if (pinchDist >= PINCH_THRESHOLD && pinchActive) {
        //     pinchActive = false;
        //     onGesture({ type: "PINCH_RELEASE" });
        // }

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

    // HELPERS
    function isPalmOpen(lm) {
        const fingers = [
            [8, 5],   // index
            [12, 9],  // middle
            [16, 13], // ring
            [20, 17], // pinky
        ];

        let extended = 0;
        for (const [tip, mcp] of fingers) {
            if (dist(lm[tip], lm[mcp]) > 0.12) {
                extended++;
            }
        }

        const thumbExtended = dist(lm[4], lm[2]) > 0.15;

        return extended >= 4 && thumbExtended;
    }



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