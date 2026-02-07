import gsap from "gsap";
import { k } from "../core/kaplay";

export function animText({
    text,
    fontSize = 70,
    color = "#FFFFFF",
    duration = 1.2,
    z = 10,
    onComplete,
}) {
    const startY = k.height() + 80;
    const centerY = k.height() / 2;

    const label = k.add([
        k.text(text, {
            size: fontSize,
            font: "Steve",
        }),
        k.color(color),
        k.anchor("center"),
        k.pos(k.width() / 2, startY),
        k.z(z),
        k.opacity(1),
        k.fixed(),
    ]);

    const tl = gsap.timeline({
        onComplete: () => {
            label.destroy();
            onComplete?.();
        },
    });

    tl.to(label.pos, {
        y: centerY,
        duration: duration * 0.4,
        ease: "power3.out",
    })
        .to(label, {
            opacity: 1,
            duration: duration * 0.2,
        })
        .to(label.pos, {
            y: k.height() + 120,
            duration: duration * 0.4,
            ease: "power3.in",
        })
        .to(label, {
            opacity: 0,
            duration: duration * 0.3,
        }, "<");

    return label;
}
