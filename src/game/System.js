import { InputContext } from '@milquejs/milque';

export class System {
  async load() {}
  async unload() {}

  init() {}
  dead() {}

  /**
   * @param {InputContext} axb 
   */
  input(axb) {}
  /** @param {number} dt */
  update(dt) {}
}
