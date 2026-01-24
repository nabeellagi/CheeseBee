import { k } from "../core/kaplay";

export function cheeseEntity({
    pos = k.center(),
    z = 1
} = {}){
    const root = k.add([
        k.pos(pos),
        k.z(z),
        k.anchor("center")
    ]);

    const SPRITE_LIST = [];

    return root;
}