// Procedural sound effects using Web Audio API - no files needed!

export class SoundManager {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)()
  }

  play(frequency, duration, type = 'square', volume = 0.3) {
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.type = type
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime)
    gain.gain.setValueAtTime(volume, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration)
    osc.start(this.ctx.currentTime)
    osc.stop(this.ctx.currentTime + duration)
  }

  hitBrick() {
    this.play(440, 0.1, 'square', 0.2)
  }

  hitPaddle() {
    this.play(220, 0.1, 'sine', 0.2)
  }

  collectPowerup() {
    this.play(660, 0.05, 'sine', 0.3)
    setTimeout(() => this.play(880, 0.1, 'sine', 0.3), 50)
    setTimeout(() => this.play(1100, 0.15, 'sine', 0.3), 100)
  }

  loseLife() {
    this.play(200, 0.3, 'sawtooth', 0.3)
    setTimeout(() => this.play(150, 0.4, 'sawtooth', 0.3), 200)
  }
}