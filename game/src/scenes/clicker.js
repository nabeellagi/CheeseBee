import { k } from "../core/kaplay";
import { grabberEntity } from "../entity/grabber";
// import { createHandTracker } from "../utils/handTracker";
import { createPointerHandTracker } from "../utils/pointerTracker";

export function registerClicker() {
    k.scene("clicker", () => {
        k.debug.inspect = true;

        // ==== SET UP ====
        const LAYERS = {
            grabber: 4,
            cat: 5,
            cheese: 5,
            bee: 5
        };
        const grabber = grabberEntity({
            z: LAYERS.grabber
        })
        // ==== HAND STATE ====
        let currentDir = null;
        let dragging = false;
        let visualAngle = 0;
        let targetAngle = 0;
        let facingLeft = false;

        // ==== VIDEO ====
        const video = document.createElement("video");
        video.style.display = "none";
        document.body.appendChild(video);

        createPointerHandTracker({
            videoEl: video,
            onGesture: (g) => {
                switch (g.type) {
                    case "DIRECTION":
                        currentDir = g.value;
                        break;

                    case "STOP":
                        currentDir = null;
                        break;

                    case "DRAG_START":
                        dragging = true;
                        break;

                    case "DRAG_RELEASE":
                        dragging = false;
                        break;
                }
            },
        });

        // ==== UPDATE LOOP ====
        k.onUpdate(() => {
            grabber.targetVel = k.vec2(0, 0);

            if (currentDir) {
                if (currentDir.includes("UP")) {
                    grabber.targetVel.y -= 1;
                    // grabber.scale.y = 1;
                    // grabber.scale.x = 1;
                };
                if (currentDir.includes("DOWN")) {
                    grabber.targetVel.y += 1;
                    // grabber.scale.y = -1;
                    // grabber.scale.x = -1;


                };
                if (currentDir.includes("LEFT")) {
                    grabber.targetVel.x -= 1
                    // grabber.angle = -40;
                };
                if (currentDir.includes("RIGHT")) {
                    grabber.targetVel.x += 1
                    // grabber.angle = 40;
                };

                if (grabber.targetVel.len() > 0) {
                    grabber.targetVel = grabber.targetVel
                        .unit()
                        .scale(grabber.speed);
                }
            } else {
                grabber.angle = 0;
                grabber.scale.y = 1;
            }

            if(dragging){
                grabber.sprite.use(k.sprite("pawclose"))
            }else{
                grabber.sprite.use(k.sprite("pawopen"))
            }

            // Acceleration-based movement
            const accel = grabber.targetVel
                .sub(grabber.vel)
                .scale(grabber.smooth * k.dt());

            grabber.vel = grabber.vel.add(accel);
            grabber.pos = grabber.pos.add(grabber.vel.scale(k.dt()));

            // === ROTATION ===
            const vel = grabber.vel;
            const speed = vel.len();

            if (speed > 5) {
                const nx = vel.x / speed;
                const ny = vel.y / speed;

                // FLIP
                if (Math.abs(nx) > 0.2) {
                    facingLeft = nx < 0;
                }

                // ANGLE
                targetAngle =
                    ny * 55 +   // up/down
                    nx * 55;    // diagonal
            } else {
                targetAngle = 0;
            }

            visualAngle = k.lerp(
                visualAngle,
                targetAngle,
                10 * k.dt()
            );

            grabber.sprite.angle = visualAngle;
            grabber.sprite.flipX = facingLeft;

            clampToWorld(grabber);
        });

    });
}

function clampToWorld(ent) {
    const paddW = 10;
    const paddH = 10;

    ent.pos.x = k.clamp(
        ent.pos.x,
        paddW,
        k.width() - paddW
    );

    ent.pos.y = k.clamp(
        ent.pos.y,
        paddH,
        k.height() - paddH
    );
}