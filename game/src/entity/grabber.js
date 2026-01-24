import { k } from "../core/kaplay";


export function grabberEntity({
    pos = k.center(),
    z = 1,

} = {}){
    // SET UP
    const BASE_SPEED = 400;
    let SPEED = BASE_SPEED;
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
            sprite: null
        },
        "grabber"
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
        "grabber"
    ])
    // Expose
    root.sprite = sprite;

    // Run
    k.onKeyPress("space", () => {
        SPEED = BASE_SPEED + 600;
        root.speed = SPEED;
    })
    k.onKeyRelease("space",() => {
        SPEED = BASE_SPEED;
        root.speed = SPEED;
    });

    // Slowdown
     k.onKeyPress("shift", () => {
        SPEED = BASE_SPEED - 300;
        root.speed = SPEED;
    })
    k.onKeyRelease("shift",() => {
        SPEED = BASE_SPEED;
        root.speed = SPEED;
    });

    return root
}
/**

 */