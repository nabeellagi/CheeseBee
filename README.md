<h1 align="center"> 🧀🐝 CheeseBee </h1>

**CheeseBee** is a gesture hand controlled casual arcade game where you protect a cat, feed it cheese, and stop angry bees! All using your **hands**.

Built with **Kaplay** for game logic and **MediaPipe** for real-time hand tracking.

---

## Gameplay Overview

You control a floating **paw grabber** using your hand gestures captured through your webcam.

Your goals are simple:

* Keep the cat alive
* Feed it cheese
* Stop bees before they hurt ur cat
* React quickly to time-based challenges

---

## How to Play (Core Mechanics)

### 🖐️ Hand Controls

The game tracks **one or two hands**, depending on the action:

| Gesture                | Action                                             |
| ---------------------- | -------------------------------------------------- |
| ☝️ Point with one hand | Move the paw in that direction (moving left requires you to point on to left direction, etc.)                    |
| 🙌 Raise both hands    | Used during clock challenge (when timer turns red so be aware, like rhythm game) |

Your webcam feed is displayed in the bottom-right corner for feedback.

---

### Cheese Mechanics

* Cheeses spawn randomly in the room.
* Touch a cheese with the paw to **pick it up**.
* Bring the cheese to the cat to:

  * Heal the cat
  * Increase score!!
  * Do a combo

---

### Bee Mechanics

* Bees spawn periodically and **zigzag-chase the cat**.
* If a bee hits the cat:

  * The cat loses HP
  * Your score decreases

* Catch bees with the paw to:
  * Prevent damage
  * Gain score
  * Extend combos

---

### Clock Challenge (Reflex System)

A clock appears with a random countdown.

1. When the timer is **normal**, do nothing and DO NOT RAISE BOTH HANDS. 
2. When the timer turns **red**:

   * Be ready.
   * **Raise your hand (open palm)** at the correct moment when the timer's red, you only got 3 sec.

Outcomes:

*  **Perfect timing** → Big score bonus
* **Too early / Missed** → Heavy score penalty

---

### Cat Health System

* The cat jumps periodically (speed increases with difficulty).
* HP decreases when hit by bees.
* Feeding cheese restores HP.
* If HP reaches zero:

  * Score resets
  * Game continues automatically

---

## Tech Stack

* **Kaplay** : Core game engine
* **MediaPipe Hands** : Hand & gesture tracking
* **GSAP** : UI animation & juice
* **IndexedDB** : Score saving

---

## How to Run the Project

### Navigate to the game folder

```bash
cd game
```

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

### Open in browser

The terminal will show a local URL, usually:

```
http://localhost:5173
```

Allow **camera access** when prompted, the game will not work without it.