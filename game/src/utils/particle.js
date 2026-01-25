import gsap from "gsap";
import { k } from "../core/kaplay";

/**
 * Spawn particles at specified positions through x and y coordinate. Randomized particles with falling effect
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate
 * @example
 * const mousePosition = mousePos();
 * particleTouch(mousePosition.x, mousePosition.y);
 */

export function particle({
    x = 0, y = 0,
    sprite,
    scale = 1
} = {}) {
  const particleCount = 22;

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 10;
    const distance = 20 + Math.random() * 70; // more variation

    const p = k.add([
      k.pos(x, y),
      k.sprite(sprite),
      k.scale(scale),
      k.opacity(1),
      k.z(99),
      k.rotate(k.randi(1, 100)),
      { life: 1 },
    ]);

    // Burst up
    gsap.to(p.pos, {
      x: x + Math.cos(angle) * distance,
      y: y + Math.sin(angle) * distance, // correct scatter
      duration: 0.3,
      ease: "power2.out",
    });

    // Fall
    gsap.to(p.pos, {
      y: "+=" + (40 + Math.random() * 20), // fall downwards
      duration: 0.5,
      delay: 0.2,
      ease: "power1.in",
    });

    // Fade out
    gsap.to(p, {
      opacity: 0,
      duration: 0.4,
      delay: 0.25,
      ease: "power1.out",
      onComplete: () => p.destroy(),
    });
  }
}