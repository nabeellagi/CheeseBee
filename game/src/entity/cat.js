import { k } from "../core/kaplay";
import gsap from 'gsap';

export function catEntity({
    pos = k.center(),
    z = 1,
}) {
    const root = k.add([
        k.anchor("center"),
        k.pos(pos),
        k.z(z),
        "cat",
        {
            isJumping: false,
            jump: () => { }
        }
    ]);

    const BASE_SCALE = 0.12;
    const sprite = root.add([
        k.sprite("idle"),
        k.scale(0.12),
        k.anchor("center")
    ]);

    const hitBox = root.add([
        k.pos(0, 0),
        k.anchor("center"),
        k.area({ shape: new k.Rect(k.vec2(-7, 0), 100, 120) }),
        k.body({ isStatic: true }),
        "cat"
    ]);

    root.jump = () => {
        if (root.isJumping) return;

        root.isJumping = true;
        sprite.use(k.sprite("jump"));

        const startX = root.pos.x;
        const startY = root.pos.y;

        const dir = k.rand() > 0.5 ? 1 : -1;
        sprite.scale.x = dir > 0 ? -BASE_SCALE : BASE_SCALE;

        const jumpHeight = k.rand(80, 130);
        const jumpDistance = k.rand(60, 120);

        const targetX = k.clamp(
            startX + dir * jumpDistance,
            50,
            k.width() - 50
        );

        const tl = gsap.timeline({
            onComplete: () => {
                root.isJumping = false;
                sprite.use(k.sprite("idle"));
                sprite.scale.x = BASE_SCALE;
                sprite.scale.y = BASE_SCALE;
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

    return root
}