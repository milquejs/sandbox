/**
 * @template T
 * @typedef {{ (...args: any[]): T } | { new (...args: any[]): T }} SystemFunction
 */

export class SystemManager {

  constructor() {
    /** @protected */
    this.states = new Map();
  }

  /**
   * @template T
   * @param {SystemFunction<T>|string|symbol} handle
   * @param {T} [initialState]
   */
  register(handle, initialState = undefined) {
    this.states.set(handle, initialState || {});
  }

  /**
   * @template T
   * @param {SystemFunction<T>|string|symbol} handle
   */
  has(handle) {
    return this.states.has(handle);
  }

  /**
   * @template T
   * @param {SystemFunction<T>|string|symbol} handle
   * @returns {T}
   */
  get(handle) {
    return this.states.get(handle);
  }

  handles() {
    return this.states.keys();
  }
}
