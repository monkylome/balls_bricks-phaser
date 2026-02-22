// Main game scene - contains paddle, ball, bricks and game logic

import { Ball } from '../objects/Ball.js'
import { Paddle } from '../objects/Paddle.js'
import { Brick } from '../objects/Brick.js'

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    const { width, height } = this.scale

    // Create paddle
    this.paddle = new Paddle(this)
    
    // Create ball
    this.ball = new Ball(this)

    // Ball bounces off paddle
    this.physics.add.collider(this.ball.sprite, this.paddle.sprite)

    // Create bricks grid
    this.bricks = []
    const rows = 5
    const cols = 8
    const brickWidth = 64
    const brickHeight = 20
    const offsetX = 104
    const offsetY = 80
    const colors = [0xff4444, 0xff8800, 0xffff00, 0x00ff00, 0x0088ff]

    for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
     const x = offsetX + col * (brickWidth + 10)
     const y = offsetY + row * (brickHeight + 10)
     const brick = new Brick(this, x, y, colors[row])
     this.bricks.push(brick)
     }
    }

    // Ball destroys bricks on hit
    this.physics.add.collider(this.ball.sprite, this.bricks.map(b => b.sprite), (ball, brickSprite) => {
    brickSprite.destroy()
    this.bricks = this.bricks.filter(b => b.sprite !== brickSprite)
    this.score += 10
    this.scoreText.setText('Score: ' + this.score)
    })

    // Score
    this.score = 0
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '18px',
      fill: '#ffffff'
    })

    // Lives
    this.lives = 3
    this.livesText = this.add.text(width - 16, 16, 'Lives: 3', {
      fontSize: '18px',
      fill: '#ffffff'
    }).setOrigin(1, 0)
  }

  update() {
    // Update paddle position every frame
    this.paddle.update(this)

    const { height } = this.scale

    // Ball fell below screen - lose a life
    if (this.ball.sprite.y > height + 20) {
      this.lives--
      this.livesText.setText('Lives: ' + this.lives)

    if (this.lives <= 0) {
      
    // Game Over
      this.scene.start('GameOverScene', { score: this.score })
    } else {
    // Reset ball position
      this.ball.sprite.setPosition(this.scale.width / 2, height - 60)
      this.ball.sprite.body.setVelocity(200, -300)
      }
    }

    // All bricks destroyed - Win!
    if (this.bricks.length === 0) {
      this.scene.start('GameOverScene', { score: this.score, win: true })
    }
    }
  }