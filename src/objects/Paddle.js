// The player-controlled paddle at the bottom of the screen

export class Paddle {
  constructor(scene) {
    const { width, height } = scene.scale

    // Create paddle as ellipse (oval shape)
    this.sprite = scene.add.ellipse(
      width / 2,      // start at center x
      height - 30,    // near the bottom
      120,            // width
      20,             // height (slightly taller for better look)
      0xc0c0c0        // silver color
    )
    
    // Add metallic effects
    this.sprite.setStrokeStyle(2, 0x00ffff, 0.8) // Cyan glow
    
    // Enable arcade physics on the paddle
    scene.physics.add.existing(this.sprite, true) // true = static body
    this.sprite.body.setSize(120, 16) // Keep collision box rectangular for better gameplay
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
  
  // Method to update paddle size (for powerups)
  setWidth(newWidth) {
    this.sprite.width = newWidth
    this.sprite.body.setSize(newWidth, 16) // Keep collision height consistent
  }
}