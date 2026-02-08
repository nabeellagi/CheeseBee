import gsap from "gsap";
import { k } from "../core/kaplay";
import { beeEntity } from "../entity/bee";
import { catEntity } from "../entity/cat";
import { grabberEntity } from "../entity/grabber";
import { hpBarUI } from "../ui/hpBar";
// import { createHandTracker } from "../utils/handTracker";
import { createPointerHandTracker } from "../utils/pointerTracker";
import { cheeseEntity } from "../entity/cheese";
import { zigzagChase } from "../utils/zigzagChase";
import { animText } from "../ui/animText";


// If ure readin this, idk what am i doin

export function registerClicker() {
    k.scene("clicker", () => {
        // k.debug.inspect = true;
        let gameState = "play";

        // MUSIC
        const getBgm = () => k.choose(["sweet", "puzzles", "party", "booty"])

        let bgm = null
        function playRandomBgm() {
            bgm = k.play(getBgm(), {
                loop: false,
            })
            bgm.onEnd(() => {
                playRandomBgm()
            })
        }
        playRandomBgm()

        // ==== SET UP CONFIG ====
        const LAYERS = {
            bg: 2,
            panel: 2,
            cat: 3,
            grabber: 4,
            cheese: 5,
            bee: 5,
            hpBar: 6
        };

        // ENTITY CONFIGs
        const MAX_CHEESE = 7;
        let currentCheese = 0;

        const MAX_BEES = 5;
        let currentBee = 0;


        // ==== SET BG ====
        k.onDraw(() => {
            k.drawSprite({
                sprite: "bgroom",
                pos: k.vec2(0, 0),
                origin: "topleft",
                fixed: true
            }),
                k.z(LAYERS.bg),
                k.fixed()
        })

        // ==== SET GRABBER n CAT ====
        const grabber = grabberEntity({
            z: LAYERS.grabber
        });
        const cat = catEntity({
            z: LAYERS.cat,
            pos: k.vec2(k.width() / 2, k.height() / 2 + 40)
        });

        // Cat dynamic
        let jumpTimer = 0;
        k.onUpdate(() => {
            jumpTimer -= k.dt();

            const diff = getDifficulty();
            const jumpInterval = k.lerp(1.2, 0.3, diff);

            if (jumpTimer <= 0) {
                cat.jump();
                jumpTimer = jumpInterval;
            }
        });

        // ===== SET HP =====
        const hpBar = hpBarUI({
            z: LAYERS.hpBar,
            maxHP: cat.hp,
            currentHP: cat.hp,
            width: 200,
            pos: k.vec2(k.width() / 2 - 70, k.height() - 90)
        });
        cat.on("hpChanged", (hp, maxHP) => {
            hpBar.setHp(hp);
            if (cat.hp === 0) {
                saveScore("death");

                gameStats.score = 0;
                gameStats.beesKilled = 0;
                gameStats.cheeseCaught = 0;
                scoreText.text = "0";

                animText({
                    text: "TRY AGAIN!",
                    fontSize: 80,
                    color: "#FF4444",
                    duration: 1.5,
                    onComplete: () => {
                        cat.setHp(maxHP);
                    },
                });
            }
        });

        // ==== COLLIDE WITH BEE =====

        // cat n bee
        cat.hitBox.onCollide("bee", (beeBox) => {
            const bee = beeBox.parent;
            if (!bee || bee.isInvincible) return;

            cat.hitBox.damage(k.randi(9, 12));

            gameStats.score = Math.max(0, gameStats.score - k.randi(2, 3));
            scoreText.text = gameStats.score.toString();

            currentBee--;
            beeBox.kill();
        });

        // grabber n bee
        grabber.hitBox.onCollide("bee", (beeBox) => {
            const bee = beeBox.parent;
            if (!bee || bee.isInvincible) return;

            gameStats.beesKilled++;
            gameStats.score += 2;
            updateScore();

            registerCombo();

            currentBee--;
            beeBox.kill();
        });

        // ==== DRAG CHEESE =====
        let carriedCheese = null;
        grabber.hitBox.onCollide("cheese", (cheeseBox) => {
            if (carriedCheese) return;
            // k.debug.log("HIT CHEESE")

            carriedCheese = cheeseBox.parent;

            carriedCheese.onDestroy(() => {
                if (carriedCheese === cheeseBox.parent) {
                    carriedCheese = null;
                }
            });

            // Optional juice
            gsap.to(carriedCheese.scale, {
                x: 0.9,
                y: 0.9,
                duration: 0.1,
                ease: "power1.out"
            });
        });
        k.onUpdate(() => {
            if (carriedCheese) {
                carriedCheese.pos = grabber.pos.add(k.vec2(0, -20));
            }
        });
        // k.on("cheeseDied", (cheese) => {
        //     if (carriedCheese === cheese) {
        //         carriedCheese = null;
        //     }
        // });

        // ===== CHEESE HEAL =====
        cat.hitBox.onCollide("cheese", (cheeseBox) => {
            const cheese = cheeseBox.parent;

            if (cheese !== carriedCheese) return;

            carriedCheese = null;

            cat.setHp(cat.hp + k.randi(6, 9));
            cat.happy();

            cheese.hitBox.kill();
            currentCheese--;

            registerCombo();

            gameStats.cheeseCaught++;
            gameStats.score += 5;
            updateScore();

        });

        // ==== HAND STATE ====
        let currentDir = null;
        // let dragging = false;
        let visualAngle = 0;
        let targetAngle = 0;
        let facingLeft = false;

        // ==== VIDEO ====
        const video = document.createElement("video");
        video.style.position = "fixed";
        video.style.right = "12px";
        video.style.bottom = "12px";
        video.style.width = "140px";
        video.style.height = "105px";
        video.style.opacity = "0.75";
        video.style.borderRadius = "10px";
        video.style.border = "2px solid rgba(255,255,255,0.6)";
        video.style.boxShadow = "0 6px 16px rgba(0,0,0,0.4)";
        video.style.zIndex = "999";
        video.style.transform = "scaleX(-1)"; // mirror
        video.style.pointerEvents = "none";   // zero interaction cost
        document.body.appendChild(video);

        createPointerHandTracker({
            videoEl: video,
            onGesture: (g) => {
                switch (g.type) {
                    case "DIRECTION":
                        currentDir = g.value;
                        break;

                    case "STOP":
                        currentDir = null;
                        break;

                    case "PALM_HOLD":
                        // alert(0)
                        onPawOpen()
                        break

                    // case "DRAG_START":
                    //     dragging = true;
                    //     break;

                    // case "DRAG_RELEASE":
                    //     dragging = false;
                    //     if (carriedCheese) {
                    //         gsap.to(carriedCheese.scale, {
                    //             x: 1,
                    //             y: 1,
                    //             duration: 0.1,
                    //         });
                    //         carriedCheese = null;
                    //     }
                    //     break;
                }
            },
        });

        // ==== UPDATE LOOP ====
        k.onUpdate(() => {
            const diff = getDifficulty();
            grabber.speed = k.lerp(400, 900, diff);

            grabber.targetVel = k.vec2(0, 0);

            if (currentDir) {
                grabber.targetVel = grabber.targetVel
                    .unit()
                    .scale(grabber.speed);
                if (currentDir.includes("UP")) {
                    grabber.targetVel.y -= 1;
                    // grabber.scale.y = 1;
                    // grabber.scale.x = 1;
                };
                if (currentDir.includes("DOWN")) {
                    grabber.targetVel.y += 1;
                    // grabber.scale.y = -1;
                    // grabber.scale.x = -1;


                };
                if (currentDir.includes("LEFT")) {
                    grabber.targetVel.x -= 1
                    // grabber.angle = -40;
                };
                if (currentDir.includes("RIGHT")) {
                    grabber.targetVel.x += 1
                    // grabber.angle = 40;
                };

                if (grabber.targetVel.len() > 0) {
                    grabber.targetVel = grabber.targetVel
                        .unit()
                        .scale(grabber.speed);
                }
            } else {
                grabber.angle = 0;
                grabber.scale.y = 1;
            }

            // if (dragging) {
            //     grabber.sprite.use(k.sprite("pawclose"))
            //     grabber.sprite.color = k.rgb(206, 184, 132)
            // } else {
            //     grabber.sprite.use(k.sprite("pawopen"))
            //     grabber.sprite.color = k.rgb(255, 255, 255)
            // }

            // Acceleration-based movement
            const accel = grabber.targetVel
                .sub(grabber.vel)
                .scale(grabber.smooth * k.dt());

            grabber.vel = grabber.vel.add(accel);
            grabber.pos = grabber.pos.add(grabber.vel.scale(k.dt()));

            // === ROTATION ===
            const vel = grabber.vel;
            const speed = vel.len();

            if (speed > 5) {
                const nx = vel.x / speed;
                const ny = vel.y / speed;

                // FLIP
                if (Math.abs(nx) > 0.2) {
                    facingLeft = nx < 0;
                }

                // ANGLE
                targetAngle =
                    ny * 55 +   // up/down
                    nx * 55;    // diagonal
            } else {
                targetAngle = 0;
            }

            visualAngle = k.lerp(
                visualAngle,
                targetAngle,
                10 * k.dt()
            );

            grabber.sprite.angle = visualAngle;
            grabber.sprite.flipX = facingLeft;

            clampToWorld(grabber);
        });

        // ==== GAME STATS ====
        const gameStats = {
            beesKilled: 0,
            cheeseCaught: 0,
            score: 0,
        };

        let scoreLoaded = false;
        let lastSaveTime = 0;
        const SAVE_INTERVAL = 20; // seconds

        function updateScore() {
            beesKilled.text = `Bees Killed :\n${gameStats.beesKilled}`;
            cheeseCatched.text = `Cheese Catched :\n${gameStats.cheeseCaught}`;
            scoreText.text = gameStats.score.toString();

            const diff = getDifficulty();
            const speedScale = k.lerp(1, 2.5, diff);
            cat.setSpeedScale(speedScale);
        }

        // ==== PANEL UI =====
        const panelRoot = k.add([
            k.z(LAYERS.panel),
            k.anchor("center"),
            k.pos(200, 320),
            k.sprite("panel1"),
            k.area(),
            {
                isDragging: false
            }
        ]);
        const beesKilled = panelRoot.add([
            k.text("Bees Killed :\n0", {
                font: "Kimbab",
                size: 22,
            }),
            k.color("#8F0000"),
            k.anchor("right"),
            k.pos(10, -120)
        ]);
        const cheeseCatched = panelRoot.add([
            k.text("Cheese Catched :\n0", {
                font: "Kimbab",
                size: 22
            }),
            k.color("#8F0000"),
            k.anchor("right"),
            k.pos(80, -35)
        ]);
        const highScore = panelRoot.add([
            k.text("High Score :\n0", {
                font: "Kimbab",
                size: 22
            }),
            k.color("#8F0000"),
            k.anchor("right"),
            k.pos(20, 150)
        ])
        panelRoot.add([
            k.text("SCORE", {
                font: "Kimbab",
                size: 32
            }),
            k.color("#8F0000"),
            k.anchor("center"),
            k.pos(0, 30)
        ])
        const scoreText = panelRoot.add([
            k.text("0", {
                font: "Kimbab",
                size: 44
            }),
            k.color("#8F0000"),
            k.anchor("center"),
            k.pos(0, 70)
        ]);
        gsap.to(panelRoot.pos,
            {
                y: panelRoot.pos.y + 50,
                yoyo: true,
                repeat: -1,
                ease: "power2.inOut"
            }
        );

        panelRoot.onClick(() => {
            gsap.killTweensOf(panelRoot.pos);
            panelRoot.isDragging = true;
        });
        panelRoot.onMouseRelease(() => {
            panelRoot.isDragging = false;
            gsap.to(panelRoot.pos,
                {
                    y: panelRoot.pos.y + 50,
                    yoyo: true,
                    repeat: -1,
                    ease: "power2.inOut"
                }
            );
        })
        panelRoot.onUpdate(() => {
            if (!panelRoot.isDragging) return;
            // panelRoot.pos = k.mousePos();

            const target = k.mousePos();
            panelRoot.pos = panelRoot.pos.lerp(target, 0.25);
        });

        let bestScore = 0;

        // (async () => {
        //     const saved = await dbGet("score");
        //     if (saved) {
        //         bestScore = saved.best ?? 0;
        //         highScore.text = `High Score :\n${bestScore}`;
        //     }
        // })();

        // (async () => {
        //     const saved = await dbGet("score");
        //     if (saved) {
        //         bestScore = saved.best ?? 0;
        //         gameStats.score = saved.current ?? 0;

        //         highScore.text = `High Score :\n${bestScore}`;
        //         scoreText.text = gameStats.score.toString();
        //     }
        // })()

        // SCORESSS

        (async () => {
            const saved = await dbGet("score");
            if (saved) {
                bestScore = saved.best ?? 0;
                gameStats.score = saved.current ?? 0;

                highScore.text = `High Score :\n${bestScore}`;
                scoreText.text = gameStats.score.toString();
            }
            scoreLoaded = true;
        })();

        function saveScore(reason = "auto") {
            if (!scoreLoaded) return;

            bestScore = Math.max(bestScore, gameStats.score);

            dbSet("score", {
                current: gameStats.score,
                best: bestScore,
            });

            highScore.text = `High Score :\n${bestScore}`;

            if (reason === "auto") {
                const txt = k.add([
                    k.text("Saving score...", {
                        size: 32,
                        font: "steve",
                    }),
                    k.color(k.rgb(85, 40, 1)),
                    k.anchor("left"),
                    k.pos(k.width() - 300, 200),
                    k.opacity(0),
                    k.z(100),
                ]);

                gsap.to(txt, { opacity: 1, duration: 0.25 });
                gsap.to(txt, {
                    opacity: 0,
                    delay: 0.8,
                    duration: 0.4,
                    onComplete: () => txt.destroy(),
                });
            }
        }

        k.loop(SAVE_INTERVAL, () => {
            saveScore("auto");
        });



        // ==== CLOCK SYSTEM ====
        const clockState = {
            timeLeft: 0,
            duration: 0,
            phase: "idle",
            waitingForPaw: false,
            pawReceived: false,
        }

        const clock = k.add([
            k.sprite("clock"),
            k.anchor("center"),
            k.pos(k.width() - 100, k.height() - 300)
        ]);
        const clockText = k.add([
            k.text("00:00", {
                font: "Steve",
                size: 49,
                letterSpacing: 1.5
            }),
            k.color("#351402"),
            k.anchor("center"),
            k.pos(k.width() - 106, k.height() - 270)
        ]);

        function startClock() {
            clockState.duration = k.randi(8, 12)
            clockState.timeLeft = clockState.duration
            clockState.phase = "countdown"
            clockState.waitingForPaw = false
            clockState.pawReceived = false

            animText({
                text: "READY!",
                fontSize: 40,
                color: "#FFD700",
                duration: 0.6,
            })
        }
        startClock();

        k.onUpdate(() => {
            if (clockState.phase === "idle") return

            clockState.timeLeft -= k.dt()

            // WARNING PHASE
            if (
                clockState.timeLeft <= 3 &&
                clockState.phase === "countdown"
            ) {
                clockState.phase = "warning"
                clockState.waitingForPaw = true

                clockText.color = k.rgb(200, 0, 0)

                const ticktock = k.play("ticktock", {
                    volume: 3
                })
                k.wait(3, () => ticktock.stop())
            }


            // INPUT WINDOW
            if (
                clockState.timeLeft <= 0 &&
                clockState.phase !== "resolve"
            ) {
                resolveClock()
            }

            updateClockText()
        })

        function updateClockText() {
            const t = Math.max(0, clockState.timeLeft)
            const seconds = Math.ceil(t)

            clockText.text = `00:${seconds.toString().padStart(2, "0")}`
        }
        function onPawOpen() {
            if (clockState.phase === "resolve") return;

            // TOO EARLY
            if (!clockState.waitingForPaw) {
                gameStats.score = Math.max(0, gameStats.score - 20);

                updateScore();

                animText({
                    text: "TOO EARLY!",
                    fontSize: 42,
                    color: "#ff0101",
                    duration: 1,
                });
                return;
            }

            clockState.pawReceived = true;
            resolveClock();
        }

        function resolveClock() {
            clockState.phase = "resolve"
            clockState.waitingForPaw = true

            if (clockState.pawReceived) {
                gameStats.score += 50;
                updateScore()

                animText({
                    text: "PERFECT!",
                    fontSize: 90,
                    color: "#f6ff00",
                    duration: 1.2,
                })

                k.play("perf", {
                    volume: 1.7
                })

            } else {
                gameStats.score = Math.max(0, gameStats.score - 50);
                updateScore()

                animText({
                    text: "MISSED!",
                    fontSize: 55,
                    color: "#FF2222",
                    duration: 1.2,
                })

            }

            k.wait(1.5, () => {
                clockText.color = k.rgb(53, 20, 2)
                startClock()
            })
        }


        // ==== COMBO SYSTEM ====
        let combo = 0;
        let comboTimer = 0;
        k.onUpdate(() => {
            comboTimer -= k.dt();
            if (comboTimer <= 0) combo = 0;
        });
        function registerCombo() {
            combo++;
            comboTimer = 2; // seconds to continue combo

            if (combo >= 2 && combo <= 4) {
                animText({
                    text: `COMBO x${combo}!`,
                    fontSize: 50 + combo * 4,
                    color: "#FFD700",
                    duration: 0.9,
                    z: 8,
                });

                k.play("combo");

                gameStats.score += combo;
                updateScore();
            }
        }

        // ==== SPAWN ====

        function spawnCheese() {
            currentCheese++;
            return cheeseEntity({
                z: LAYERS.cheese,
                pos: k.vec2(
                    k.rand(80, k.width() - 80),
                    k.rand(80, k.height() - 80)
                )
            })
        };
        k.loop(3.5, () => {
            if (currentCheese < MAX_CHEESE) spawnCheese()
        });

        function spawnBee() {
            currentBee++;

            const bee = beeEntity({
                z: LAYERS.bee,
                pos: k.vec2(
                    k.rand(-20, k.width() + 20),
                    k.rand(0, k.width() + 50)
                )
            });
            const diff = getDifficulty();
            const beeSpeed = k.lerp(130, 350, diff);
            bee.onUpdate(
                zigzagChase(cat, {
                    speed: beeSpeed
                })
            );
            return bee
        }
        k.loop(k.randi(3, 5), () => {
            if (currentBee < MAX_BEES) spawnBee()
        });

        function getDifficulty() {
            const cycleLength = 25;
            const rampUp = 20;
            const rampDown = 5;

            const cheese = gameStats.cheeseCaught;
            const cyclePos = cheese % cycleLength;

            if (cyclePos < rampUp) {
                return cyclePos / rampUp;
            }

            const downPos = cyclePos - rampUp;
            return 1 - (downPos / rampDown);
        }

    });
}

function clampToWorld(ent) {
    const paddW = 10;
    const paddH = 10;

    ent.pos.x = k.clamp(
        ent.pos.x,
        paddW,
        k.width() - paddW
    );

    ent.pos.y = k.clamp(
        ent.pos.y,
        paddH,
        k.height() - paddH
    );
}


// SAVE FILE HELPERS

const DB_NAME = "clicker-db";
const STORE = "scores";

function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);

        req.onupgradeneeded = () => {
            req.result.createObjectStore(STORE);
        };

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function dbGet(key) {
    const db = await openDB();
    return new Promise((resolve) => {
        const tx = db.transaction(STORE, "readonly");
        const store = tx.objectStore(STORE);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
    });
}

async function dbSet(key, value) {
    const db = await openDB();
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(value, key);
}
