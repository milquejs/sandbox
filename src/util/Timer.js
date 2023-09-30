export class Timer {
  static now() {
    return performance.now();
  }

  /**
   * @param {number} timeout
   */
  constructor(timeout) {
    this.timeout = timeout;
    this.progress = 0;
    this.timestamp = 0;
    this.paused = true;
  }

  /**
   * @param {number} value
   */
  setTimeout(value) {
    this.timeout = value;
    return this;
  }

  /**
   * @param {number} now
   */
  start(now = Timer.now()) {
    this.timestamp = now;
    this.paused = false;
  }

  /**
   * @param {number} now
   */
  stop(now = Timer.now()) {
    if (!this.paused) {
      this.progress += now - this.timestamp;
    }
    this.timestamp = now;
    this.paused = true;
  }

  /**
   * @param {number} now
   */
  done(now = Timer.now()) {
    if (!this.paused) {
      this.progress += now - this.timestamp;
    }
    this.timestamp = now;
    if (this.progress > this.timeout) {
      return true;
    }
  }

  /**
   * @param {number} now
   */
  reset(now = Timer.now()) {
    this.timestamp = now;
    this.progress = 0;
  }
}
