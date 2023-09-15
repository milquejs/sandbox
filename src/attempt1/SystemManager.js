/**
 * @template M
 * @template Result
 * @typedef {(m: M) => Result|void} SystemFunction
 */

/**
 * @template M
 * @template Result
 * @typedef {M & { current: SystemFunction<M, Result>, result: Result|undefined }} SystemContext
 */

/**
 * @template {object} M
 */
export class SystemManager {
  /**
   * @private
   * @type {Array<SystemFunction<M, any>>}
   */
  systems = [];
  /**
   * @private
   * @type {Array<SystemContext<M, any>|null>}
   */
  contexts = [];

  /**
   * @param {SystemFunction<M, any>} handle
   */
  register(handle) {
    if (this.systems.includes(handle)) {
      return this;
    }
    this.systems.push(handle);
    this.contexts.push(null);
    return this;
  }

  /**
   * @param {SystemFunction<M, any>} handle
   */
  unregister(handle) {
    let i = this.systems.indexOf(handle);
    if (i < 0) {
      return this;
    }
    this.systems.splice(i, 1);
    this.contexts.splice(i, 1);
    return this;
  }

  /**
   * @template Result
   * @param {M} context
   * @param {SystemFunction<M, Result>} handle
   */
  run(context, handle) {
    let i = this.systems.indexOf(handle);
    if (i < 0) {
      i = this.systems.length;
      this.systems.push(handle);
      this.contexts.push(deriveContext(handle, context));
    }
    let m = this.contexts[i];
    if (!m) {
      m = deriveContext(handle, context);
      this.contexts[i] = m;
    }
    if (typeof m.result !== 'undefined') {
      return;
    }
    let result = handle(m);
    m.result = result;
    return result;
  }

  /**
   * @param {SystemFunction<M, any>} handle
   */
  has(handle) {
    return this.systems.indexOf(handle) >= 0;
  }

  /**
   * @template T
   * @param {SystemFunction<M, T>} handle
   * @returns {T|undefined}
   */
  context(handle) {
    let i = this.systems.indexOf(handle);
    if (i < 0) {
      return;
    }
    return this.contexts[i]?.result;
  }

  values() {
    return this.systems;
  }
}

/**
 * @template {object} M
 * @template Result
 * @param {SystemFunction<M, Result>} handle
 * @param {M} context
 * @returns {SystemContext<M, Result>}
 */
function deriveContext(handle, context) {
  let result = /** @type {SystemContext<M, Result>} */ ({
    current: handle,
    result: undefined,
  });
  Object.setPrototypeOf(result, context);
  return result;
}
