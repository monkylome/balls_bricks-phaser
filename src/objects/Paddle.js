// The player-controlled paddle at the bottom of the screen

export class Paddle {
  constructor(scene) {
    const { width, height } = scene.scale

    // Create paddle as a rectangle graphic
    this.sprite = scene.add.rectangle(
      width / 2,      // start at center x
      height - 30,    // near the bottom
      120,            // width
      16,             // height
      0x00ffff        // cyan color
    )

    // Enable arcade physics on the paddle
    scene.physics.add.existing(this.sprite, true) // true = static body
  }

  update(scene) {
    const { width } = scene.scale
    const pointer = scene.input.activePointer

    // Follow mouse/touch position
    this.sprite.x = Phaser.Math.Clamp(
      pointer.x,
      this.sprite.width / 2,
      width - this.sprite.width / 2
    )

    // Refresh static body position after moving
    this.sprite.body.reset(this.sprite.x, this.sprite.y)
  }
}