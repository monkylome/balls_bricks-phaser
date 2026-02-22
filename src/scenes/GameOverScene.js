// Game Over Scene - Shown when player wins or loses

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' })
  }

  init(data) {
    this.finalScore = data.score
    this.isWin = data.win || false
  }

  create() {
    const { width, height } = this.scale

    const message = this.isWin ? '🎉 YOU WIN!' : 'GAME OVER'
    const color = this.isWin ? '#00ff00' : '#ff4444'

    this.add.text(width / 2, height / 3, message, {
      fontSize: '48px',
      fill: color,
      fontStyle: 'bold'
    }).setOrigin(0.5)

    this.add.text(width / 2, height / 2, 'Score: ' + this.finalScore, {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5)

    this.add.text(width / 2, height * 0.7, 'Click to Play Again', {
      fontSize: '18px',
      fill: '#aaaaaa'
    }).setOrigin(0.5)

    this.input.on('pointerdown', () => {
      this.scene.start('MenuScene')
    })
  }
}