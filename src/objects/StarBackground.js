// Animated starfield background

export class StarBackground {
  constructor(scene) {
    this.stars = []
    const { width, height } = scene.scale

    // Create 3 layers of stars (depth effect)
    const layers = [
      { count: 80, speed: 0.2, size: 1, alpha: 0.4 },  // far
      { count: 50, speed: 0.5, size: 2, alpha: 0.7 },  // mid
      { count: 20, speed: 1.0, size: 3, alpha: 1.0 },  // close
    ]

    layers.forEach(layer => {
      for (let i = 0; i < layer.count; i++) {
        const star = scene.add.circle(
          Phaser.Math.Between(0, width),
          Phaser.Math.Between(0, height),
          layer.size,
          0xffffff
        ).setAlpha(layer.alpha)

        this.stars.push({
          circle: star,
          speed: layer.speed,
          size: layer.size
        })
      }
    })
  }

  update() {
    this.stars.forEach(star => {
      // Move stars downward slowly
      star.circle.y += star.speed

      // Reset to top when off screen
      if (star.circle.y > 600) {
        star.circle.y = 0
        star.circle.x = Phaser.Math.Between(0, 800)
      }

      // Twinkle effect
      if (Phaser.Math.Between(0, 100) > 98) {
        star.circle.setAlpha(Phaser.Math.FloatBetween(0.2, 1.0))
      }
    })
  }
}