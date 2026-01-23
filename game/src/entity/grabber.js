import { k } from "../core/kaplay";


export function grabberEntity({
    pos = k.center(),
    z = 1,

} = {}){
    // SET UP
    const SPEED = 400;
    const SMOOTHNESS = 12;

    const root = k.add([
        k.pos(pos),
        k.z(z),
        k.anchor("center"),
        {
            vel: k.vec2(0, 0),
            targetVel: k.vec2(0, 0),
            speed: SPEED,
            smooth: SMOOTHNESS,
        },
    ]);

    const sprite = root.add([
        // k.sprite("grabber") SOON REPLACED BUT NOW BOX
        k.rect(80, 80),
        k.color(k.rgb(230, 20, 20))
    ]);

    return root
}