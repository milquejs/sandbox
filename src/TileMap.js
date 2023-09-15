export class TileMap {
  /**
   * @param {number} width 
   * @param {number} height 
   * @param {object} opts
   * @param {typeof Uint8Array|typeof Uint16Array|typeof Uint32Array} opts.typedArray
   */
  constructor(width, height, opts = { typedArray: Uint8Array }) {
    this.width = width;
    this.height = height;
    this.length = width * height;
    this.array = new opts.typedArray(this.length);
  }

  /**
   * @param {number} x 
   * @param {number} y 
   * @param {number} value 
   */
  set(x, y, value) {
    this.array[x + y * this.width] = value;
  }

  /**
   * @param {number} x 
   * @param {number} y
   */
  at(x, y) {
    return this.array[x + y * this.width];
  }

  /**
   * @param {number} [fromX]
   * @param {number} [fromY]
   * @param {number} [toX]
   * @param {number} [toY]
   */
  *values(fromX = 0, fromY = 0, toX = this.width - 1, toY = this.height - 1) {
    const w = this.width;
    for(let y = fromY; y <= toY; ++y) {
      let dy = y * w;
      for(let x = fromX; x <= toX; ++x) {
        yield this.array[x + dy];
      }
    }
  }

  /**
   * @param {number} [fromX]
   * @param {number} [fromY]
   * @param {number} [toX]
   * @param {number} [toY]
   */
  *entries(fromX = 0, fromY = 0, toX = this.width - 1, toY = this.height - 1) {
    /**
     * @type {[number, number, number, number, TileMap]}
     */
    const value = [0, 0, 0, 0, this];
    const w = this.width;
    for(let y = fromY; y <= toY; ++y) {
      let dy = y * w;
      for(let x = fromX; x <= toX; ++x) {
        let i = x + dy;
        value[0] = x;
        value[1] = y;
        value[2] = this.array[i];
        value[3] = i;
        yield value;
      }
    }
  }

  [Symbol.iterator]() {
    return this.values();
  }
}
