// Main game scene - contains paddle, ball, bricks and game logic

import { Ball } from '../objects/Ball.js'
import { Brick } from '../objects/Brick.js'
import { Paddle } from '../objects/Paddle.js'

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

    // Ball bounces off paddle with flash effect
    this.physics.add.collider(this.ball.sprite, this.paddle.sprite, () => {
      this.tweens.add({
        targets: this.paddle.sprite,
        fillColor: { from: 0xffffff, to: 0x00ffff },
        duration: 150,
        ease: 'Linear'
      })
    })

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

    // Create particle texture
    const graphics = this.make.graphics({ x: 0, y: 0, add: false })
    graphics.fillStyle(0xffffff)
    graphics.fillCircle(4, 4, 4)
    graphics.generateTexture('particle', 8, 8)
    graphics.destroy()

    // Particle emitter for brick explosions
    this.particles = this.add.particles(0, 0, 'particle', {
      speed: { min: 50, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      lifespan: 400,
      quantity: 12,
      emitting: false
    })

    // Ball destroys bricks on hit
    this.physics.add.collider(this.ball.sprite, this.bricks.map(b => b.sprite), (ball, brickSprite) => {
      this.particles.setPosition(brickSprite.x, brickSprite.y)
      this.particles.explode(12)
      brickSprite.destroy()
      this.bricks = this.bricks.filter(b => b.sprite !== brickSprite)
      this.score += 10
      this.scoreText.setText('Score: ' + this.score)
    })

    // Star trail pool
    this.starPool = []
    for (let i = 0; i < 30; i++) {
    const star = this.add.text(0, 0, '★', {
      fontSize: Phaser.Math.Between(8, 18) + 'px',
      fill: '#ffff00'
    }).setAlpha(0).setOrigin(0.5)
    this.starPool.push({
      text: star,
      active: false,
      alpha: 0,
      vx: 0,
      vy: 0,
      fadeSpeed: 0
    })
   }
    this.trailTimer = 0

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
  // Spawn new star every few frames
  this.trailTimer++
  if (this.trailTimer % 4 === 0) {
    const star = this.starPool.find(s => !s.active)
    if (star) {
      star.text.setPosition(this.ball.sprite.x, this.ball.sprite.y)
      star.text.setFontSize(Phaser.Math.Between(8, 18))
      star.alpha = Phaser.Math.FloatBetween(0.5, 1.0)
      star.text.setAlpha(star.alpha)
      star.vx = Phaser.Math.FloatBetween(-1.5, 1.5)
      star.vy = Phaser.Math.FloatBetween(-1.5, 1.5)
      star.fadeSpeed = Phaser.Math.FloatBetween(0.01, 0.04)
      star.active = true
    }
  }

  // Update active stars
  this.starPool.forEach(star => {
    if (star.active) {
      star.text.x += star.vx
      star.text.y += star.vy
      star.alpha -= star.fadeSpeed
      star.text.setAlpha(star.alpha)
      if (star.alpha <= 0) {
        star.active = false
        star.text.setAlpha(0)
      }
    }
  })

  // Update paddle position every frame
  this.paddle.update(this)

  const { height } = this.scale

  // Ball fell below screen - lose a life
  if (this.ball.sprite.y > height + 20) {
    this.lives--
    this.livesText.setText('Lives: ' + this.lives)
    this.cameras.main.shake(300, 0.02)

    if (this.lives <= 0) {
      this.scene.start('GameOverScene', { score: this.score })
    } else {
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