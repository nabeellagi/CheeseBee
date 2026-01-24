import { k } from "../core/kaplay";


export function grabberEntity({
    pos = k.center(),
    z = 1,

} = {}){
    // SET UP
    const SPEED = 700;
    const SMOOTHNESS = 15;

    const root = k.add([
        k.pos(pos),
        k.z(z),
        k.anchor("center"),
        k.rotate(0),
        k.scale(1),
        {
            vel: k.vec2(0, 0),
            targetVel: k.vec2(0, 0),
            speed: SPEED,
            smooth: SMOOTHNESS,
        },
    ]);

    const sprite = root.add([
        k.sprite("pawopen"), 
        k.scale(0.045),
        k.rotate(0),
        k.pos(0,0),
        k.anchor("center")
        // k.rect(80, 80),
    ]);

    const hitbox = root.add([
        k.pos(0,0),
        k.anchor("center"),
        k.area({ shape: new k.Rect(k.vec2(0, 0), 35, 40) }),
        k.body({ isStatic: true }),
    ])
    // Expose
    root.sprite = sprite;

    return root
}

/**

 */