// Animated starfield background - vertical scrolling

export class StarBackground {
  constructor(scene) {
    this.stars = []
    const { width, height } = scene.scale

    // Create 3 layers of stars (parallax depth effect)
    const layers = [
      { count: 80, speed: 1.5, size: 1, alpha: 0.4 },  // far (slow)
      { count: 50, speed: 3.0, size: 2, alpha: 0.7 },  // mid
      { count: 30, speed: 5.0, size: 3, alpha: 1.0 },  // close (fast)
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
      // Move stars downward (giving feeling of moving upward)
      star.circle.y += star.speed

      // Reset to top when off screen
      if (star.circle.y > 600) {
        star.circle.y = 0
        star.circle.x = Phaser.Math.Between(0, 800)
      }
    })
  }
}