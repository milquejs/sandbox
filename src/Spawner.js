/** @template T */
export class Spawner {
  /**
   * @param {typeof T} factory 
   */
  constructor(factory) {
    /** @private */
    this.factory = factory;

    /** @type {Array<T>} */
    this.objects = [];
  }

  spawn() {
    let result = new (this.factory)();
    this.objects.push(result);
    return result;
  }
}