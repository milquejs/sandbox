/** @typedef {() => void|Promise<void>|AfterEffectHandler|Promise<AfterEffectHandler>} EffectHandler */
/** @typedef {() => void|Promise<void>} AfterEffectHandler */
/** @typedef {Array<any>} EffectDependencyList */

/** @template Handle */
export class EffectManager {
  /** @type {Map<Handle, EffectContext>} */
  contexts = new Map();

  /**
   * @param {Handle} handle
   * @returns {EffectContext}
   */
  get(handle) {
    let result = this.contexts.get(handle);
    if (!result) {
      result = new EffectContext();
      this.contexts.set(handle, result);
    }
    return result;
  }

  /**
   * @param {Handle} handle
   */
  has(handle) {
    return this.contexts.has(handle);
  }

  async clear() {
    let contexts = [...this.contexts.values()];
    this.contexts.clear();
    await Promise.all(contexts.map((context) => context.revert()));
  }
}

export class EffectContext {
  constructor() {
    /** @type {Array<EffectHandler|undefined>} */
    this.befores = []; // Defined if prepared to apply.
    /** @type {Array<AfterEffectHandler|undefined>} */
    this.afters = []; // Defined if already applied.
    /** @type {Array<EffectDependencyList|undefined>} */
    this.memos = []; // Defined if captured at all, applied or not.
    this.index = -1;
  }

  open() {
    if (this.index >= 0) {
      throw new Error('Cannot open already opened effect context.');
    }
    this.index = 0;
    return this;
  }

  close() {
    if (this.index < 0) {
      throw new Error('Cannot close already closed effect context.');
    }
    this.index = -1;
    return this;
  }

  isOpen() {
    return this.index >= 0;
  }

  /**
   * @param {EffectHandler} handler
   * @param {EffectDependencyList|undefined} [deps]
   */
  capture(handler, deps = undefined) {
    if (this.index < 0) {
      throw new Error(
        'Cannot capture outside of closed effect context - must be opened first.',
      );
    }
    let current = this.index;
    if (current < this.befores.length) {
      let prev = this.memos[current];
      if (!isMemoized(prev, deps)) {
        this.befores[current] = handler;
        this.memos[current] = deps;
      }
    } else {
      this.befores.push(handler);
      this.memos.push(deps);
      this.afters.push(undefined);
    }
    ++this.index;
  }

  async apply() {
    if (this.index >= 0) {
      throw new Error(
        'Cannot apply inside of opened effect context - must be closed first.',
      );
    }
    let len = this.befores.length;
    for (let i = 0; i < len; ++i) {
      const before = this.befores[i];
      const after = this.afters[i];
      this.befores[i] = undefined;
      this.afters[i] = undefined;
      if (!before) {
        continue;
      }
      if (typeof after === 'function') {
        // Clean-up the previous handler before starting the new one.
        await after();
        if (
          typeof this.befores[i] !== 'undefined' ||
          typeof this.afters[i] !== 'undefined'
        ) {
          // NOTE: While awaiting for after() to complete, we have already prepared/applied
          //  a new handler. Just exit and use that instead.
          return;
        }
      }
      let next = undefined;
      if (typeof before === 'function') {
        // Start the next one.
        next = (await before()) || undefined;
        if (
          typeof this.befores[i] !== 'undefined' ||
          typeof this.afters[i] !== 'undefined'
        ) {
          // NOTE: While awaiting for before() to complete, we have already prepared/applied
          //  a new handler. Clean-up and use the new one instead.
          if (typeof next === 'function') {
            await next();
          }
          return;
        }
      }
      // Both are still undefined, so set it to next!
      this.afters[i] = next;
    }
  }

  async revert() {
    if (this.index >= 0) {
      throw new Error(
        'Cannot revert inside of opened effect context - must be closed first.',
      );
    }
    // NOTE: Clean-up all the afters. Do not start any befores.
    let len = this.afters.length;
    for (let i = 0; i < len; ++i) {
      let after = this.afters[i];
      if (typeof after === 'function') {
        await after();
      }
      this.afters[i] = undefined;
    }
  }
}

/**
 * @param {Array<any>|undefined} prev
 * @param {Array<any>|undefined} next
 */
function isMemoized(prev, next) {
  if (
    !Array.isArray(prev) ||
    !Array.isArray(next) ||
    next.length !== prev.length
  ) {
    return false;
  }
  for (let i = 0; i < prev.length; ++i) {
    // NOTE: Do shallow equality for memo check.
    if (prev[i] !== next[i]) {
      return false;
    }
  }
  return true;
}
