import gsap from "gsap";
import { k } from "../core/kaplay";
import { particle } from "../utils/particle";

export function cheeseEntity({
    pos = k.center(),
    z = 1
} = {}) {
    const root = k.add([
        k.pos(pos),
        k.z(z),
        k.anchor("center"),
        k.scale(k.rand(0.6, 1)),
        k.rotate(k.randi(-90, 90))
    ]);

    const MODEL = [
        {
            sprite: 'cheese1',
            shape: new k.Polygon([
                k.vec2(-40, -30),
                k.vec2(-50, 40),
                k.vec2(55, 42),
                k.vec2(60, 30),
            ]),
        },
        {
            sprite: 'cheese2',
            shape: new k.Rect(k.vec2(0, 0), 82, 70),
        }
    ];
    const modelIndex = k.randi(0, MODEL.length);
    // const modelIndex = 0

    const sprite = root.add([
        k.sprite(MODEL[modelIndex].sprite),
        k.scale(0.05),
        k.anchor("center")
    ]);

    const hitBox = root.add([
        k.pos(0, 0),
        k.anchor("center"),
        k.area({ shape: MODEL[modelIndex].shape }),
        k.body({ isStatic: true }),
        "cheese",
        {
            kill: (color = k.rgb(100, 255, 144)) => {
                if (root.isInvincible) return;
                root.isInvincible = true;
                
                sprite.color = color;
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

                particle({
                    x: root.pos.x,
                    y: root.pos.y,
                    sprite: "honey",
                    scale: 0.015
                })
            }
        }
    ])

    root.sprite = sprite;
    root.hitBox = hitBox;
       
    return root;
}