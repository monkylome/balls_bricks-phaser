// Entry point of the game - sets up Phaser config and starts the game
import Phaser from 'phaser'
import { MenuScene } from './scenes/MenuScene.js'
import { GameScene } from './scenes/GameScene.js'
import { GameOverScene } from './scenes/GameOverScene.js'

const config = {
  type: Phaser.AUTO,  // auto-detect WebGL or Canvas
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',  // simple arcade physics
    arcade: { debug: false }
  },
  scene: [MenuScene, GameScene, GameOverScene]  // scenes load in this order
}

new Phaser.Game(config)