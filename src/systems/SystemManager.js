import { EffectManager } from './EffectManager';

/**
 * @template {object} M
 * @typedef {(m: M) => void} SystemFunction
 */

/**
 * @template {object} M
 * @typedef {M & { current: SystemFunction<M> }} SystemContext<M>
 */

/**
 * @template {object} M
 */
export class SystemManager {

  /** @type {Array<SystemFunction<M>>} */
  systems = [];
  /** @type {Array<SystemContext<M>|null>} */
  contexts = [];

  /**
   * @param {SystemFunction<M>} handle
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
   * @param {SystemFunction<M>} handle
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
   * @param {M} context 
   * @param {SystemFunction<M>} handle
   */
  run(context, handle) {
    let i = this.systems.indexOf(handle);
    if (i < 0) {
      return;
    }
    let m = this.contexts[i];
    if (!m) {
      m = createContext(handle, context);
      this.contexts[i] = m;
    }
    handle(m);
  }

  /**
   * @param {SystemFunction<M>} handle
   */
  has(handle) {
    return this.systems.indexOf(handle) >= 0;
  }

  values() {
    return this.systems;
  }
}

/**
 * @template {object} M
 * @param {SystemFunction<M>} handle 
 * @param {M} context
 * @returns {SystemContext<M>}
 */
function createContext(handle, context) {
  let result = /** @type {SystemContext<M>} */ ({
    current: handle,
  });
  Object.setPrototypeOf(result, context);
  return result;
}
