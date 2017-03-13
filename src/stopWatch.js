export class Stopwatch {
  constructor() {
    this.start = new Date();
  }
  start() {

  }
  reset() {
    this.start = new Date();
  }
  stop() {
    this.end = new Date()
  }
  eslaped() {
    let end = this.end || new Date();
    let duration = end - this.start;
    let minutes = parseInt((duration / (1000 * 60)) % 60);
    let seconds = parseFloat((duration / 1000) % 60).toFixed(1);
    return `${minutes} ${minutes > 0 ? 'mins' : 'min'} ${seconds} secs`;
  }
}