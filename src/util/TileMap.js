export class TileMap {
  /**
   * @param {number} width
   * @param {number} height
   */
  constructor(width, height) {
    this.width = Math.round(width);
    this.height = Math.round(height);
    this.length = this.width * this.height;
    this.values = new Uint8Array(this.length);
    this.pos = new TileMapPos(this);
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  at(x, y) {
    return this.pos.fromCoords(x, y);
  }

  /**
   * @param {number} index
   */
  atIndex(index) {
    return this.pos.fromIndex(index);
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  get(x, y) {
    return this.values[x + y * this.width];
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} value
   */
  set(x, y, value) {
    this.values[x + y * this.width] = value;
  }

  /**
   * @param {number} fromX
   * @param {number} fromY
   * @param {number} toX
   * @param {number} toY
   * @param {number} value
   */
  fill(fromX, fromY, toX, toY, value) {
    for (let y = fromY; y <= toY; ++y) {
      for (let x = fromX; x <= toX; ++x) {
        let i = x + y * this.width;
        this.values[i] = value;
      }
    }
  }
}

export class TileMapPos {
  /** @param {TileMap} parent */
  constructor(parent) {
    /** @private */
    this.parent = parent;
    /** @private */
    this._x = 0;
    /** @private */
    this._y = 0;
    /** @private */
    this._i = 0;
  }

  get value() {
    return this.parent.values[this._i];
  }

  set value(value) {
    this.parent.values[this._i] = value;
  }

  get x() {
    return this._x;
  }

  set x(value) {
    this._x = value;
    if (value >= 0 && value < this.parent.width) {
      this._i = this._x + this._y * this.parent.width;
    } else {
      this._i = -1;
    }
  }

  get y() {
    return this._y;
  }

  set y(value) {
    this._y = value;
    if (value >= 0 && value < this.parent.height) {
      this._i = this._x + this._y * this.parent.width;
    } else {
      this._i = -1;
    }
  }

  get index() {
    return this._i;
  }

  set index(value) {
    this.fromIndex(value);
  }

  isWithinBounds(dx = 0, dy = 0) {
    let nextIndex = this._i + (dx + dy * this.parent.width);
    return nextIndex >= 0 && nextIndex < this.parent.length;
  }

  up(amount = 1) {
    this._y -= amount;
    if (this._y >= 0 && this._y < this.parent.height) {
      this._i = this._x + this._y * this.parent.width;
    } else {
      this._i = -1;
    }
    return this;
  }

  down(amount = 1) {
    this._y += amount;
    if (this._y >= 0 && this._y < this.parent.height) {
      this._i = this._x + this._y * this.parent.width;
    } else {
      this._i = -1;
    }
    return this;
  }

  left(amount = 1) {
    this._x -= amount;
    if (this._x >= 0 && this._x < this.parent.width) {
      this._i = this._x + this._y * this.parent.width;
    } else {
      this._i = -1;
    }
    return this;
  }

  right(amount = 1) {
    this._x += amount;
    if (this._x >= 0 && this._x < this.parent.width) {
      this._i = this._x + this._y * this.parent.width;
    } else {
      this._i = -1;
    }
    return this;
  }

  next() {
    return this.fromIndex(this._i + 1);
  }

  /**
   * @param {number} index
   */
  fromIndex(index) {
    if (index >= 0 && index < this.parent.length) {
      this._i = index;
    } else {
      this._i = -1;
    }
    this._x = index % this.parent.width;
    this._y = Math.floor(index / this.parent.width);
    return this;
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  fromCoords(x, y) {
    return this.fromIndex(x + y * this.parent.width);
  }
}
