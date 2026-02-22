// First screen the player sees - shows title and start instructions

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' }) // unique key to identify this scene
  }

  create() {
    const { width, height } = this.scale

    // Title text
    this.add.text(width / 2, height / 3, 'BALLS, BRICKS & PHASERS', {
      fontSize: '32px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Subtitle
    this.add.text(width / 2, height / 2, 'Click or Press SPACE to Start', {
      fontSize: '18px',
      fill: '#aaaaaa'
    }).setOrigin(0.5)

    // Start on click
    this.input.on('pointerdown', () => {
      this.scene.start('GameScene')
    })

    // Start on SPACE
    this.input.keyboard.on('keydown-SPACE', () => {
      this.scene.start('GameScene')
    })
  }
}