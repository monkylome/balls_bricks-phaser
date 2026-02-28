 Balls, Bricks & Phasers
A Breakout/Arkanoid-style game built with Phaser 3 for the Z01 Athens Game Jam — "Balls, Bricks and Phasers" (February 2026).

🚀 Run Locally
Requirements

Node.js v18+
npm v10+

Setup
'''bash 
git clone https://github.com/monkylome/balls_bricks-phaser.git

cd balls_bricks-phaser

npm install

npm run dev
'''

Open your browser at 
http://localhost:5173

Build for production
bashnpm run build
Output will be in the dist/ folder.

📁 Project Structure
balls_bricks-phaser/
├── index.html
├── vite.config.js
├── public/
│   └── assets/
│       ├── images/
│       └── audio/
│           └── music.mp3
└── src/
    ├── main.js
    ├── SoundManager.js
    ├── scenes/
    │   ├── MenuScene.js
    │   ├── GameScene.js
    │   └── GameOverScene.js
    └── objects/
        ├── Paddle.js
        ├── Ball.js
        ├── Brick.js
        ├── Powerup.js
        └── StarBackground.js


📝 Jam Info
Submitted to: Z01 Athens — "Balls, Bricks and Phasers" Game Jam
Category target: 🎯 Best Feel / Playfull
Team size: gtzimoka & kchatzian
Time spent: 1 day

🕹️ How to Play
Use your mouse to move the paddle left and right.
Keep the ball in play and destroy all the bricks to win!
You have 3 lives — don't let the ball fall below the paddle.

🎯 Controls
ActionControlMove paddleMouse movementStart gameClick or SPACERestartClick (on Game Over screen)

⚡ Powerups
Powerups drop randomly (30% chance) when a brick is destroyed. Catch them with your paddle!
PowerupSymbolEffectWideWMakes your paddle wider for 8 secondsStar★Bonus +50 pointsMagnetMPaddle attracts the ball for 5 secondsLightning⚡Paddle shoots lightning for 5 seconds — changes ball direction on hit

🌟 Features

🌌 Animated starfield background with parallax layers and twinkling effect
⭐ Star trail on the ball — each star drifts and fades randomly
💥 Particle explosions when bricks are destroyed
📳 Camera shake when you lose a life
✨ Paddle flash effect on ball hit
🎵 Background music (David Byrne - Dance on Vaseline, Thievery Corporation remix)
🔊 Procedural sound effects — no audio files needed for SFX
4 unique powerups with visual indicators
Colorful brick grid with 5 rows in different colors


📊 Scoring
ActionPointsDestroy a brick+10Collect Star powerup+50

🏆 Win / Lose

Win: Destroy all 40 bricks
Lose: Run out of all 3 lives
After either outcome you can click to return to the main menu and play again


🛠️ Built With

Phaser 3 — HTML5 game framework
Vite 4 — build tool & dev server
Web Audio API — procedural sound effects
Vanilla JavaScript (ES Modules)

🎵 Credits

Music: David Byrne - Dance on Vaseline (Thievery Corporation remix)
Framework: Phaser 3
Build Tool: Vite
AI Assistance: Claude by Anthropic
