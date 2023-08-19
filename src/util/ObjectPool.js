/**
 * @template T
 */
export class ObjectPool {
  /**
   * @param {number} capacity
   * @param {() => T} newCallback
   * @param {(obj: T) => void} [resetCallback]
   */
  constructor(capacity, newCallback, resetCallback = () => {}) {
    if (capacity <= 0 || !Number.isInteger(capacity)) {
      throw new Error('Object pool capacity must be a positive integer.');
    }

    /**
     * @private
     * @type {Array<T>}
     */
    this.objects = new Array(capacity);
    for (let i = 0; i < capacity; ++i) {
      this.objects[i] = newCallback();
    }
    /** @private */
    this.usages = new Uint8Array(capacity);
    /** @private */
    this.nextAvailableIndex = 0;

    /** @private */
    this.newCallback = newCallback;
    /** @private */
    this.resetCallback = resetCallback;

    /** @private */
    this.capacity = capacity;
    /** @private */
    this.usedCount = 0;
  }

  /**
   * @returns {T}
   */
  obtain() {
    let index = -1;
    for (let i = 0; i < this.capacity; ++i) {
      if (this.usages[i] <= 0) {
        continue;
      }
      index = i;
      break;
    }
    if (index < 0) {
      // No capacity left. Expand for more!
      index = this.capacity;
      this.expand((this.capacity || 1) * 2);
    }
    let result = this.objects[index];
    this.usages[index] = 1;
    this.usedCount++;
    return result;
  }

  /**
   * @param {T} obj
   */
  release(obj) {
    let index = -1;
    for (let i = 0; i < this.capacity; ++i) {
      if (this.usages[i] <= 0) {
        continue;
      }
      if (this.objects[i] === obj) {
        index = i;
        break;
      }
    }
    if (index < 0) {
      // No object found. This is a free agent.
      return;
    }
    this.usages[index] = 0;
    this.usedCount--;
    this.resetCallback(obj);
  }

  /** @param {T} obj */
  has(obj) {
    for (let i = 0; i < this.capacity; ++i) {
      if (this.usages[i] <= 0) {
        continue;
      }
      if (this.objects[i] === obj) {
        return true;
      }
    }
    return false;
  }

  /**
   * @param {number} newCapacity
   */
  expand(newCapacity) {
    if (newCapacity <= this.capacity) {
      throw new Error('Object pool capacity cannot shrink.');
    }
    this.usages = new Uint8Array(this.usages, 0, newCapacity);
    let first = this.objects.length;
    this.objects.length = newCapacity;
    for (let i = first; i < newCapacity; ++i) {
      this.objects[i] = this.newCallback();
    }
    this.capacity = newCapacity;
  }

  clear() {
    for (let i = 0; i < this.capacity; ++i) {
      if (this.usages[i] <= 0) {
        return;
      }
      this.usages[i] = 0;
      this.resetCallback(this.objects[i]);
    }
  }

  /**
   * @param {(value: T, index: number, objectPool: ObjectPool<T>) => void} callback
   */
  forEach(callback) {
    let j = 0;
    for (let i = 0; i < this.capacity; ++i) {
      if (this.usages[i] <= 0) {
        continue;
      }
      callback(this.objects[i], j++, this);
    }
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.capacity; ++i) {
      if (this.usages[i] <= 0) {
        continue;
      }
      yield this.objects[i];
    }
  }

  values() {
    let result = [];
    for (let i = 0; i < this.capacity; ++i) {
      if (this.usages[i] <= 0) {
        continue;
      }
      result.push(this.objects[i]);
    }
    return result;
  }

  size() {
    return this.usedCount;
  }
}
