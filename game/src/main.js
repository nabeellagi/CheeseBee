import { k } from "./core/kaplay";
import { preloadAll } from "./core/kaplay/preload";
import { registerClicker } from "./scenes/clicker";

registerClicker();

// k.go("clicker")
(async () => {
    await preloadAll();

    registerClicker();
    k.go("clicker");
})();