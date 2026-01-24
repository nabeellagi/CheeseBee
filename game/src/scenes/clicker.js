import { k } from "../core/kaplay";
import { catEntity } from "../entity/cat";
import { grabberEntity } from "../entity/grabber";
// import { createHandTracker } from "../utils/handTracker";
import { createPointerHandTracker } from "../utils/pointerTracker";

export function registerClicker() {
    k.scene("clicker", () => {
        k.debug.inspect = true;

        // ==== SET UP ====
        const LAYERS = {
            bg: 2,
            cat: 3,
            grabber: 4,
            cheese: 5,
            bee: 5
        };
        // ==== SET BG ====
        k.onDraw(() => {
            k.drawSprite({
                sprite: "bgroom",
                pos: k.vec2(0, 0),
                origin: "topleft",
            }),
            k.z(LAYERS.bg)
        })

        // ==== SET GRABBER n CAT ====
        const grabber = grabberEntity({
            z: LAYERS.grabber
        });
        const cat = catEntity({
            z: LAYERS.cat,
            pos: k.vec2(k.width()/2, k.height()/2 + 40)
        });
        k.loop(2.5, () => cat.jump())
        // ==== HAND STATE ====
        let currentDir = null;
        let dragging = false;
        let visualAngle = 0;
        let targetAngle = 0;
        let facingLeft = false;

        // ==== VIDEO ====
        const video = document.createElement("video");
        video.style.position = "fixed";
        video.style.right = "12px";
        video.style.bottom = "12px";
        video.style.width = "140px";
        video.style.height = "105px";
        video.style.opacity = "0.75";
        video.style.borderRadius = "10px";
        video.style.border = "2px solid rgba(255,255,255,0.6)";
        video.style.boxShadow = "0 6px 16px rgba(0,0,0,0.4)";
        video.style.zIndex = "999";
        video.style.transform = "scaleX(-1)"; // mirror
        video.style.pointerEvents = "none";   // zero interaction cost
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

            if (dragging) {
                grabber.sprite.use(k.sprite("pawclose"))
                grabber.sprite.color = k.rgb(206, 184, 132)
            } else {
                grabber.sprite.use(k.sprite("pawopen"))
                grabber.sprite.color = k.rgb(255, 255, 255)
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