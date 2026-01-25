import gsap from "gsap";
import { k } from "../core/kaplay";

export function beeEntity({
    pos = k.center(),
    z = 1,
    animSpeed = 0.09
} = {}) {
    const BEE_SCALE = k.rand(1.2, 0.4);

    const root = k.add([
        k.pos(pos),
        k.z(z),
        k.scale(BEE_SCALE),
        k.anchor("center"),
        "bee", {
            isAlive: true,
            isInvincible: false
        }
    ]);

    const sprite = root.add([
        k.sprite("bee0"),
        k.anchor("center"),
        k.rotate(0),
        k.scale(0.05)
    ]);

    const hitBox = root.add([
        k.pos(0, 0),
        k.anchor("center"),
        k.area({ shape: new k.Rect(k.vec2(0, 0), 65, 50) }),
        k.body({ isStatic: true }),
        "bee",
        {
            kill: () => {
                if (root.isInvincible) return;
                root.isInvincible = true;

                sprite.color = k.rgb(255, 100, 100);
                gsap.fromTo(sprite, {
                    opacity: 0.6,
                }, {
                    opacity: 0.4,
                    duration: 0.1,
                    repeat: 7,
                    yoyo: true,
                    ease: "power1.inOut",
                    onComplete: () => {
                        root.destroy();
                    }
                });
                gsap.to(sprite, {
                    angle: 180,
                    ease: "power2.out",
                }, "<")
            }
        }
    ]);

    // ==== ANIMATE ====
    const frames = ["bee0", "bee1"];
    let frameIndex = 0;
    let timer = 0;
    root.onUpdate(() => {
        if (!root.isAlive) return;
        timer += k.dt();
        if (timer >= animSpeed) {
            timer = 0;
            frameIndex = (frameIndex + 1) % frames.length
            sprite.use(k.sprite(frames[frameIndex]))
        }
    });

    return root;
}