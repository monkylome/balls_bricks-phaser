// A single brick that can be destroyed by the ball

export class Brick {
  constructor(scene, x, y, color = 0xff4444) {
    this.sprite = scene.add.rectangle(x, y, 64, 20, color)
    scene.physics.add.existing(this.sprite, true) // static body
  }
}