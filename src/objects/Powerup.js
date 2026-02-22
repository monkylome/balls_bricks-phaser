// Powerups that drop from destroyed bricks

export class Powerup {
  constructor(scene, x, y) {
    // Random powerup type
    const types = ['wide', 'star', 'magnet', 'multiball', 'lightning']
    this.type = types[Phaser.Math.Between(0, 4)]

    // Colors per type
    const colors = {
      wide: 0x0088ff,
      star: 0xffff00,
      magnet: 0xff00ff,
      multiball: 0xff8800,
      lightning: 0x00ffff
    }

    // Labels per type
    const labels = {
      wide: 'W',
      star: '★',
      magnet: 'M',
      multiball: '+',
      lightning: '⚡'
    }

    // Background circle
    this.sprite = scene.add.circle(x, y, 14, colors[this.type])
    scene.physics.add.existing(this.sprite)
    this.sprite.body.setVelocity(0, 120) // fall down

    // Label
    this.label = scene.add.text(x, y, labels[this.type], {
      fontSize: '12px',
      fill: '#000000'
    }).setOrigin(0.5)
  }

  update() {
    // Label follows sprite
    this.label.setPosition(this.sprite.x, this.sprite.y)
  }

  destroy() {
    this.label.destroy()
    this.sprite.destroy()
  }
}