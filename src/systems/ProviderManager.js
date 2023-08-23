/**
 * @template M
 * @template T
 * @typedef {({ (m: M): T } | { new (m: M): T }} ProviderFunction
 */

const GLOBAL_SCOPE = null;

export class ProviderManager {

  constructor() {
    /** @type {Map<ProviderFunction<any, any>, Map<any, any>>} */
    this.values = new Map();
  }

  /**
   * @template M
   * @template T
   * @param {M} context
   * @param {ProviderFunction<M, T>} handle 
   * @param {T} [initial]
   */
  provide(context, handle, initial = undefined) {
    return this.provideFor(context, GLOBAL_SCOPE, handle, initial);
  }

  /**
   * @template M
   * @template T
   * @param {M} context
   * @param {any} scope
   * @param {ProviderFunction<M, T>} handle 
   * @param {T} [initial]
   */
  provideFor(context, scope, handle, initial = undefined) {
    if (typeof initial === 'undefined') {
      try {
        // @ts-ignore
        initial = handle(context);
      } catch {
        // @ts-ignore
        initial = new handle(context);
      }
    }
    let scoped = this.values.get(handle);
    if (!scoped) {
      scoped = new Map();
      this.values.set(handle, scoped);
    }
    scoped.set(scope, initial);
    return this;
  }

  /**
   * @param {ProviderFunction<any, any>} handle
   */
  unregister(handle) {
    return this.unregisterForScope(GLOBAL_SCOPE, handle);
  }

  /**
   * @param {any} scope
   * @param {ProviderFunction<any, any>} handle
   */
  unregisterForScope(scope, handle) {
    let scoped = this.values.get(handle);
    if (scoped) {
      scoped.delete(scope);
    }
    return this;
  }

  /**
   * @template T
   * @param {any} scope
   * @param {ProviderFunction<any, T>} handle 
   * @returns {T}
   */
  get(scope, handle) {
    const scoped = this.values.get(handle);
    if (!scoped) {
      throw new Error(`Cannot get provider for unregistered handle '${String(handle)}'.`);
    }
    return scoped.get(scope) || scoped.get(GLOBAL_SCOPE);
  }

  /**
   * @param {any} scope
   * @param {ProviderFunction<any, any>} handle
   */
  has(scope, handle) {
    const scoped = this.values.get(handle);
    if (!scoped) {
      return false;
    }
    return scoped.has(scope) || scoped.has(GLOBAL_SCOPE);
  }
}
