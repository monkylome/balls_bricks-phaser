// A single brick that can be destroyed by the ball

export class Brick {
  constructor(scene, x, y, baseColor = 0xff4444) {
    const width = 64
    const height = 20
    const mortarSize = 2 // γκρι αρμός

    // Δημιουργία custom graphics για realistic brick look
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false })

    // 1. Mortar (γκρι αρμός) - background
    graphics.fillStyle(0x808080, 1)
    graphics.fillRect(0, 0, width, height)

    // 2. Κύριο χρώμα τούβλου (με mortar spacing)
    graphics.fillStyle(baseColor, 1)
    graphics.fillRect(mortarSize, mortarSize, width - mortarSize * 2, height - mortarSize * 2)

    // 3. Highlight (ανοιχτή γραμμή πάνω για depth)
    const highlightColor = this.lightenColor(baseColor, 40)
    graphics.fillStyle(highlightColor, 1)
    graphics.fillRect(mortarSize, mortarSize, width - mortarSize * 2, 2)

    // 4. Shadow (σκούρα γραμμή κάτω για depth)
    const shadowColor = this.darkenColor(baseColor, 40)
    graphics.fillStyle(shadowColor, 1)
    graphics.fillRect(mortarSize, height - mortarSize - 2, width - mortarSize * 2, 2)

    // Δημιουργία texture από το graphics
    graphics.generateTexture('brick_' + baseColor, width, height)
    graphics.destroy()

    // Δημιουργία sprite με το custom texture
    this.sprite = scene.add.image(x, y, 'brick_' + baseColor)
    scene.physics.add.existing(this.sprite, true) // static body
  }

  // Helper: Ανοίγει το χρώμα (για highlight)
  lightenColor(color, amount) {
    const r = Math.min(255, ((color >> 16) & 0xff) + amount)
    const g = Math.min(255, ((color >> 8) & 0xff) + amount)
    const b = Math.min(255, (color & 0xff) + amount)
    return (r << 16) | (g << 8) | b
  }

  // Helper: Σκουραίνει το χρώμα (για shadow)
  darkenColor(color, amount) {
    const r = Math.max(0, ((color >> 16) & 0xff) - amount)
    const g = Math.max(0, ((color >> 8) & 0xff) - amount)
    const b = Math.max(0, (color & 0xff) - amount)
    return (r << 16) | (g << 8) | b
  }
}