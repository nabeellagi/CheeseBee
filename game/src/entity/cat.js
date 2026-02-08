import { k } from "../core/kaplay";
import gsap from 'gsap';

export function catEntity({
    pos = k.center(),
    z = 1,
    hp = 100,
    speedScale = 1
}) {
    // ==== SET UP ====
    let isInvincible = false;

    const root = k.add([
        k.anchor("center"),
        k.pos(pos),
        k.z(z),
        "cat",
        {
            isJumping: false,
            jump: () => { },

            hp: hp,
            maxHp: hp,
            speedScale: speedScale,
            setHp(value) {
                root.hp = k.clamp(value, 0, root.maxHp);
                root.trigger("hpChanged", root.hp, root.maxHp);
                k.shake(3)
            },
            setSpeedScale(value) {
                root.speedScale = value
            }
        }
    ]);

    const BASE_SCALE = 0.12;
    const sprite = root.add([
        k.sprite("idle"),
        k.scale(0.12),
        k.anchor("center"),
        k.opacity(1),
        k.color(k.rgb(255, 255, 255))
    ]);

    const hitBox = root.add([
        k.pos(0, 0),
        k.anchor("center"),
        k.area({ shape: new k.Rect(k.vec2(-7, 0), 100, 120) }),
        k.body({ isStatic: true }),
        "cat",
        {
            damage: (amount) => {
                if (isInvincible) return;

                root.hp = k.clamp(root.hp - amount, 0, hp);
                isInvincible = true;
                sprite.color = k.rgb(255, 100, 100);

                sprite.use(k.sprite("hurt"));
                gsap.fromTo(sprite, {
                    opacity: 0.6
                }, {
                    opacity: 0.1,
                    duration: 0.1,
                    repeat: 7,
                    yoyo: true,
                    ease: "power1.inOut",
                    onComplete: () => {
                        k.wait(0.6, () => {     // HIT COOLDOWN
                            isInvincible = false;
                            sprite.opacity = 1;
                            sprite.color = k.rgb(255, 255, 255);
                            sprite.use(k.sprite("idle"));
                        });
                    }
                });
                root.trigger("hpChanged", root.hp, root.maxHp);

                k.shake(6);

                // ==== DEATH CASE ====
                if (root.hp <= 0) {
                    root.trigger("dead");
                }
            }
        }
    ]);
    root.hitBox = hitBox;

    root.jump = () => {
        if (root.isJumping) return;

        root.isJumping = true;

        if (sprite.sprite === "idle") sprite.use(k.sprite("jump"));

        const startX = root.pos.x;
        const startY = root.pos.y;

        const dir = k.rand() > 0.5 ? 1 : -1;
        sprite.scale.x = dir > 0 ? -BASE_SCALE : BASE_SCALE;

        const jumpHeight = k.rand(60, 100) * root.speedScale;
        const jumpDistance = k.rand(60, 120) * root.speedScale;

        const targetX = k.clamp(
            startX + dir * jumpDistance,
            50,
            k.width() - 50
        );

        if (k.rand() < 0.42) {
            k.play(k.choose(["cat1", "cat2"]), {
                volume: 1.4,
            })
        }
        const tl = gsap.timeline({
            onComplete: () => {
                root.isJumping = false;
                sprite.use(k.sprite("idle"));
                sprite.scale.x = BASE_SCALE;
                sprite.scale.y = BASE_SCALE;
                isInvincible = false
            }
        });

        // SQUASH
        tl.to(sprite.scale, {
            x: (dir > 0 ? -1 : 1) * BASE_SCALE * 1.1,
            y: BASE_SCALE * 0.85,
            duration: 0.12,
            ease: "power1.out",
        });

        // STRETCH UP
        tl.to(sprite.scale, {
            x: (dir > 0 ? -1 : 1) * BASE_SCALE,
            y: BASE_SCALE * 1,
            duration: 0.15,
            ease: "power1.out",
        });

        // UP
        tl.to(root.pos, {
            y: startY - jumpHeight,
            duration: 0.35,
            ease: "power2.out",
        });

        // SIDE
        tl.to(root.pos, {
            x: targetX,
            duration: 0.6,
            ease: "sine.inOut",
        }, 0);

        // DOWN
        tl.to(root.pos, {
            y: startY,
            duration: 0.4,
            ease: "power2.in",
        }, "-=0.1");
    };

    let isHappy = false;
    root.happy = () => {
        if (isHappy) return;

        isHappy = true;
        sprite.use(k.sprite("happy"));
        k.wait(1.2, () => {
            sprite.use(k.sprite("idle"))
            isHappy = false;
        })
    }
    return root
}