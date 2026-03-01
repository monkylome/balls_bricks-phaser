// The bouncing ball that destroys bricks

export class Ball {
  constructor(scene, paddle) {
    const { width, height } = scene.scale
    
    this.paddle = paddle
    this.scene = scene
    this.ballOffset = 0 // Offset from paddle center

    // Create ball as a circle
    this.sprite = scene.add.circle(
      paddle.sprite.x,  // start on paddle
      paddle.sprite.y - 20,  // above paddle
      10,           // radius
      0xffffff      // white color
    )

    // Enable physics
    scene.physics.add.existing(this.sprite)

    // Ball physics properties
    this.sprite.body.setCollideWorldBounds(true)
    this.sprite.body.world.setBounds(0, 0, scene.scale.width, scene.scale.height, true, true, true, false)
    this.sprite.body.setBounce(1, 1)
    this.sprite.body.setMaxVelocity(300, 300)

    // Don't start moving - stick to paddle
    this.sprite.body.setVelocity(0, 0)
    this.isLaunched = false
  }
  
  update() {
    // If not launched, roll on paddle with physics
    if (!this.isLaunched) {
      // Calculate paddle movement (velocity)
      const pointer = this.scene.input.activePointer
      const paddleVelocity = pointer.velocity ? pointer.velocity.x * 0.15 : 0 // EXTREME sensitivity
      
      // Add paddle movement to ball offset (inertia effect)
      this.ballOffset += paddleVelocity
      
      // NO FRICTION - ball stays where it rolls!
      // this.ballOffset *= 0.75 // Removed friction completely
      
      // Clamp ball to paddle edges
      const maxOffset = (this.paddle.sprite.width / 2) - 10
      this.ballOffset = Phaser.Math.Clamp(this.ballOffset, -maxOffset, maxOffset)
      
      // Position ball on paddle with offset
      this.sprite.x = this.paddle.sprite.x + this.ballOffset
      this.sprite.y = this.paddle.sprite.y - 20
    }
  }
  
  launch() {
    if (!this.isLaunched) {
      // Calculate launch angle based on ball offset from paddle center
      const normalizedOffset = this.ballOffset / ((this.paddle.sprite.width / 2) - 10)
      
      const baseSpeed = 300
      const velX = normalizedOffset * baseSpeed * 0.75
      const velY = -baseSpeed
      
      this.sprite.body.setVelocity(velX, velY)
      this.isLaunched = true
    }
  }
}