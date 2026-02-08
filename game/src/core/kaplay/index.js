import kaplay from "kaplay";
import { preloadAll } from "./preload";

export const k = kaplay({
    global: false,
    crisp: true,
    pixelDensity: 1.2,
    width: 1280,
    height: 720,
    maxFPS: 60,
    canvas: document.getElementById("game")
});
// preloadAll();
