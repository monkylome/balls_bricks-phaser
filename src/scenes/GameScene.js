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
    this.load.audio('pauseMusic', 'assets/audio/musicpause.mp3')
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

    // Pause music
    this.pauseMusic = this.sound.add('pauseMusic', {
      loop: true,
      volume: 0.4
    })

    // Create paddle
    this.paddle = new Paddle(this)

    // Create ball (pass paddle reference)
    this.ball = new Ball(this, this.paddle)

    // Ball bounces off paddle with improved physics
    this.physics.add.collider(this.ball.sprite, this.paddle.sprite, () => {
      this.sfx.hitPaddle()
      
      // Calculate hit position relative to paddle center (-1 to 1)
      const hitPos = (this.ball.sprite.x - this.paddle.sprite.x) / (this.paddle.sprite.width / 2)
      
      // Calculate new velocity based on hit position
      const speed = Math.sqrt(this.ball.sprite.body.velocity.x ** 2 + this.ball.sprite.body.velocity.y ** 2)
      const newVelX = hitPos * speed * 0.75 // 0.75 controls angle range
      const newVelY = -Math.abs(this.ball.sprite.body.velocity.y) // Always bounce up
      
      this.ball.sprite.body.setVelocity(newVelX, newVelY)
      
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
    // Space-themed neon colors
    const colors = [0xFF00FF, 0x00FFFF, 0x9D00FF, 0xFF0080, 0x00FF00]

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
    this.brickCollider = this.physics.add.collider(this.ball.sprite, this.bricks.map(b => b.sprite), (ball, brickSprite) => {
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
      
      // Update collider with remaining bricks
      this.updateBrickCollider()
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

    // Respawn system
    this.respawnTimer = 0
    this.respawnInterval = 10000 // 10 seconds
    this.originalPositions = [] // Store original brick positions
    
    // Speed increase system
    this.speedTimer = 0
    this.speedInterval = 30000 // 30 seconds
    this.speedMultiplier = 1.0
    
    // Store original positions for respawning
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = offsetX + col * (brickWidth + 10)
        const y = offsetY + row * (brickHeight + 10)
        this.originalPositions.push({ x, y, color: colors[row] })
      }
    }

    // Pause functionality
    this.isPaused = false
    this.pauseText = this.add.text(width / 2, height / 2, 'PAUSED', {
      fontSize: '48px',
      fill: '#00ffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false)

    // Pause controls (ESC or P key)
    this.input.keyboard.on('keydown-ESC', () => this.togglePause())
    this.input.keyboard.on('keydown-P', () => this.togglePause())
    
    // Launch ball with SPACE
    this.input.keyboard.on('keydown-SPACE', () => {
      if (!this.ball.isLaunched) {
        this.ball.launch()
      }
    })
    
    // Show launch instruction
    this.launchText = this.add.text(width / 2, height / 2 + 50, 'Press SPACE to launch!', {
      fontSize: '24px',
      fill: '#00ffff',
      fontStyle: 'bold'
    }).setOrigin(0.5)
  }

  update() {
    // Skip update if paused
    if (this.isPaused) return

    // Hide launch text when ball is launched
    if (this.ball.isLaunched && this.launchText.visible) {
      this.launchText.setVisible(false)
    }

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
    
    // Update ball (for sticking to paddle)
    this.ball.update()

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
        this.ball.sprite.setPosition(this.paddle.sprite.x, this.paddle.sprite.y - 20)
        this.ball.sprite.body.setVelocity(0, 0)
        this.ball.isLaunched = false
        this.ball.ballOffset = 0 // Reset ball position to center
        this.launchText.setVisible(true)
      }
    }

    // Respawn bricks in empty positions
    this.respawnTimer += this.game.loop.delta
    
    // Dynamic respawn interval based on remaining bricks
    const totalBricks = this.originalPositions.length
    const remainingBricks = this.bricks.length
    const brickPercentage = remainingBricks / totalBricks
    
    // Faster respawn when fewer bricks remain
    let dynamicInterval = this.respawnInterval
    if (brickPercentage < 0.3) { // Less than 30% bricks left
      dynamicInterval = this.respawnInterval * 0.4 // 4 seconds
    } else if (brickPercentage < 0.5) { // Less than 50% bricks left
      dynamicInterval = this.respawnInterval * 0.6 // 6 seconds
    }
    
    if (this.respawnTimer >= dynamicInterval) {
      this.respawnBricks()
      this.respawnTimer = 0
    }

    // Increase ball speed over time
    this.speedTimer += this.game.loop.delta
    if (this.speedTimer >= this.speedInterval) {
      this.increaseBallSpeed()
      this.speedTimer = 0
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
    
    // Use new setWidth method for metallic paddle
    this.paddle.setWidth(180)
    
    this.time.delayedCall(8000, () => {
      this.paddle.setWidth(120)
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
    this.paddle.sprite.setStrokeStyle(3, 0xffff00, 1.0) // Yellow glow
    this.time.delayedCall(5000, () => {
      this.lightningActive = false
      this.paddle.sprite.setStrokeStyle(2, 0x00ffff, 0.8) // Back to cyan
    })
  }

  // --- SPEED SYSTEM ---

  increaseBallSpeed() {
    if (this.ball.isLaunched) {
      this.speedMultiplier += 0.1 // Increase by 10%
      
      // Get current velocity
      const currentVelX = this.ball.sprite.body.velocity.x
      const currentVelY = this.ball.sprite.body.velocity.y
      
      // Apply speed multiplier
      this.ball.sprite.body.setVelocity(
        currentVelX * 1.1,
        currentVelY * 1.1
      )
      
      // Visual feedback
      this.cameras.main.flash(200, 255, 255, 0, false)
    }
  }

  // --- RESPAWN SYSTEM ---

  updateBrickCollider() {
    // Remove old collider
    if (this.brickCollider) {
      this.brickCollider.destroy()
    }
    
    // Create new collider with current bricks
    this.brickCollider = this.physics.add.collider(this.ball.sprite, this.bricks.map(b => b.sprite), (ball, brickSprite) => {
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
      
      // Update collider again
      this.updateBrickCollider()
    })
  }

  respawnBricks() {
    // Find empty positions
    const emptyPositions = this.originalPositions.filter(pos => {
      return !this.bricks.some(brick => 
        Math.abs(brick.sprite.x - pos.x) < 5 && 
        Math.abs(brick.sprite.y - pos.y) < 5
      )
    })

    // More bricks spawn when fewer remain
    const remainingBricks = this.bricks.length
    const totalBricks = this.originalPositions.length
    const brickPercentage = remainingBricks / totalBricks
    
    let respawnCount
    if (brickPercentage < 0.3) { // Less than 30% left
      respawnCount = Math.min(Phaser.Math.Between(4, 6), emptyPositions.length)
    } else if (brickPercentage < 0.5) { // Less than 50% left
      respawnCount = Math.min(Phaser.Math.Between(3, 4), emptyPositions.length)
    } else {
      respawnCount = Math.min(Phaser.Math.Between(2, 3), emptyPositions.length)
    }
    
    for (let i = 0; i < respawnCount; i++) {
      const randomIndex = Phaser.Math.Between(0, emptyPositions.length - 1)
      const pos = emptyPositions[randomIndex]
      
      // Create new brick with fade-in animation
      const brick = new Brick(this, pos.x, pos.y, pos.color)
      brick.sprite.setAlpha(0)
      
      this.tweens.add({
        targets: brick.sprite,
        alpha: 1,
        duration: 800,
        ease: 'Power2'
      })
      
      this.bricks.push(brick)
      emptyPositions.splice(randomIndex, 1)
    }
    
    if (respawnCount > 0) {
      this.sfx.respawnBricks() // Play respawn sound instead of powerup sound
      this.updateBrickCollider() // Update collision detection
    }
  }

  // --- PAUSE FUNCTION ---

  togglePause() {
    this.isPaused = !this.isPaused
    
    if (this.isPaused) {
      // Pause game
      this.physics.pause()
      this.bgMusic.pause()
      this.pauseMusic.play()
      this.pauseText.setVisible(true)
    } else {
      // Resume game
      this.physics.resume()
      this.pauseMusic.stop()
      this.bgMusic.resume()
      this.pauseText.setVisible(false)
    }
  }
}