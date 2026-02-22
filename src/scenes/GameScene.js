// Main game scene - contains paddle, ball, bricks and game logic

import { Ball } from '../objects/Ball.js'
import { Brick } from '../objects/Brick.js'
import { Paddle } from '../objects/Paddle.js'
import { Powerup } from '../objects/Powerup.js'
import { SoundManager } from '../SoundManager.js'
import { StarBackground } from '../objects/StarBackground.js'
export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
  }

  preload() {
    this.load.audio('music', 'assets/audio/music.mp3')
  }

  create() {
    // Starfield background
    this.starBg = new StarBackground(this)

    const { width, height } = this.scale

    // Sound manager
    this.sfx = new SoundManager()

    // Background music
    this.bgMusic = this.sound.add('music', {
      loop: true,
      volume: 0.5,
      seek: 0,
      duration: 42
    })
    this.bgMusic.play()

    // Create paddle
    this.paddle = new Paddle(this)

    // Create ball
    this.ball = new Ball(this)

    // Ball bounces off paddle with flash + sound
    this.physics.add.collider(this.ball.sprite, this.paddle.sprite, () => {
      this.sfx.hitPaddle()
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

    // Powerups
    this.powerups = []
    this.wideActive = false
    this.magnetActive = false
    this.lightningActive = false

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
      this.sfx.hitBrick()
      this.particles.setPosition(brickSprite.x, brickSprite.y)
      this.particles.explode(12)
      brickSprite.destroy()
      this.bricks = this.bricks.filter(b => b.sprite !== brickSprite)
      this.score += 10
      this.scoreText.setText('Score: ' + this.score)

      // 30% chance to drop a powerup
      if (Phaser.Math.Between(1, 100) <= 30) {
        const powerup = new Powerup(this, brickSprite.x, brickSprite.y)
        this.powerups.push(powerup)
      }
    })

    // Star trail for ball
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

    this.starBg.update()
    
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

    // Update powerups
    this.powerups.forEach(p => p.update())
    
    // Check powerup collection
   this.powerups.forEach(powerup => {
    if (Phaser.Geom.Intersects.RectangleToRectangle(
    this.paddle.sprite.getBounds(),
    powerup.sprite.getBounds()
  )) {
    this.sfx.collectPowerup()
    switch (powerup.type) {
      case 'wide':
        this.activateWide()
        break
      case 'star':
        this.score += 50
        this.scoreText.setText('Score: ' + this.score)
        break
      case 'magnet':
        this.activateMagnet()
        break
      case 'lightning':
        this.activateLightning()
        break
    }
    powerup.destroy()
    this.powerups = this.powerups.filter(p => p !== powerup)
  }
})

    // Magnet effect
    if (this.magnetActive) {
      const dx = this.paddle.sprite.x - this.ball.sprite.x
      this.ball.sprite.body.setVelocityX(
        this.ball.sprite.body.velocity.x + dx * 0.05
      )
    }

    // Update paddle
    this.paddle.update(this)

    const { height } = this.scale

    // Ball fell below screen - lose a life
    if (this.ball.sprite.y > height + 20) {
      this.sfx.loseLife()
      this.lives--
      this.livesText.setText('Lives: ' + this.lives)
      this.cameras.main.shake(300, 0.02)

      if (this.lives <= 0) {
        this.bgMusic.stop()
        this.scene.start('GameOverScene', { score: this.score })
      } else {
        this.ball.sprite.setPosition(this.scale.width / 2, height - 60)
        this.ball.sprite.body.setVelocity(200, -300)
      }
    }

    // All bricks destroyed - Win!
    if (this.bricks.length === 0) {
      this.bgMusic.stop()
      this.scene.start('GameOverScene', { score: this.score, win: true })
    }
  }

  // --- POWERUP FUNCTIONS ---

  activateWide() {
    if (this.wideActive) return
    this.wideActive = true
    this.tweens.add({
      targets: this.paddle.sprite,
      width: 180,
      duration: 200
    })
    this.time.delayedCall(8000, () => {
      this.tweens.add({
        targets: this.paddle.sprite,
        width: 120,
        duration: 200
      })
      this.wideActive = false
    })
  }

  activateMagnet() {
    this.magnetActive = true
    this.time.delayedCall(5000, () => {
      this.magnetActive = false
    })
  }

  activateLightning() {
    this.lightningActive = true
    this.paddle.sprite.setFillStyle(0xffff00)
    this.time.delayedCall(5000, () => {
      this.lightningActive = false
      this.paddle.sprite.setFillStyle(0x00ffff)
    })
  }
}