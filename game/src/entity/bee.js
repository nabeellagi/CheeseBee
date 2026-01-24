import { k } from "../core/kaplay";

export function beeEntity({
    pos = k.center(),
    z = 1
} = {}){
    const root = k.add([
        k.pos(pos),
        k.z(1),
        k.anchor("center")
    ]);

    return root;
}