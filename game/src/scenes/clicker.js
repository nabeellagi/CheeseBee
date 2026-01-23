import { k } from "../core/kaplay";
import { grabberEntity } from "../entity/grabber";
import { createHandTracker } from "../utils/handTracker";
import { createPointerHandTracker } from "../utils/pointerTracker";

export function registerClicker() {
    k.scene("clicker", () => {
        k.debug.inspect = true;

        // ==== SET UP ====
        const LAYERS = {
            grabber: 4,
        };
        const grabber = grabberEntity({
            z: LAYERS.grabber
        })
        // ==== VIDEO AND TRACKER SET ====
        const video = document.createElement("video");
        video.style.display = "none";
        document.body.appendChild(video);
        let currentDir = null;

        createPointerHandTracker({
            videoEl: video,
            onGesture: (g) => {
                if (g.type === "DIRECTION") {
                    currentDir = g.value;
                }

                if (g.type === "STOP") {
                    currentDir = null;
                }
            },
        });

        k.onUpdate(() => {
            grabber.vel.x = 0;
            grabber.vel.y = 0;

            if (currentDir) {
                if (currentDir.includes("UP")) grabber.vel.y -= 1;
                if (currentDir.includes("DOWN")) grabber.vel.y += 1;
                if (currentDir.includes("LEFT")) grabber.vel.x -= 1;
                if (currentDir.includes("RIGHT")) grabber.vel.x += 1;

                grabber.vel = grabber.vel.unit().scale(grabber.speed);
            }

            grabber.pos = grabber.pos.add(grabber.vel.scale(k.dt()));
            clampToWorld(grabber);
        });

    });
}

function clampToWorld(ent) {
    const halfW = 40;
    const halfH = 40;

    ent.pos.x = k.clamp(
        ent.pos.x,
        halfW,
        k.width() - halfW
    );

    ent.pos.y = k.clamp(
        ent.pos.y,
        halfH,
        k.height() - halfH
    );
}
