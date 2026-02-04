import { k } from "../core/kaplay"

export function zigzagChase(player,
    {
        speed = 140,
        zigzagStrength = 0.6,
        zigzagFrequency = 6
    } = {}
) {
    let t = k.rand(0, 100)

    return function () {
        const enemy = this;

        if (!enemy.exists()) return;

        const toPlayer = player.pos.sub(enemy.pos)
        if (toPlayer.len() === 0) return

        const forward = toPlayer.unit()
        const perpendicular = k.vec2(-forward.y, forward.x)

        t += k.dt() * zigzagFrequency

        const zigzag =
            perpendicular.scale(Math.sin(t) * zigzagStrength)
        
        // if

        const finalDir = forward.add(zigzag).unit()
        enemy.move(finalDir.scale(speed))
    }
}
