// The bouncing ball that destroys bricks

export class Ball {
  constructor(scene) {
    const { width, height } = scene.scale

    // Create ball as a circle
    this.sprite = scene.add.circle(
      width / 2,    // start at center x
      height - 60,  // just above paddle
      10,           // radius
      0xffffff      // white color
    )

    // Enable physics
    scene.physics.add.existing(this.sprite)

    // Ball physics properties
    this.sprite.body.setCollideWorldBounds(true) // jump only left, right and up
    this.sprite.body.world.setBounds(0, 0, scene.scale.width, scene.scale.height, true, true, true, false)
    this.sprite.body.setBounce(1, 1)             // perfect bounce
    this.sprite.body.setMaxVelocity(300, 300)

    // Start moving
    this.sprite.body.setVelocity(200, -300)

    this.isLaunched = true
  }
}