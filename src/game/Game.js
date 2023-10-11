import { AnimationFrameDetail, InputContext } from '@milquejs/milque';

/**
 * @typedef GameSystemLike
 * @property {() => Promise<void>} [load]
 * @property {() => Promise<void>} [unload]
 * @property {() => void} [init]
 * @property {() => void} [dead]
 * @property {(axb: InputContext) => void} [input]
 * @property {(dt: number) => void} update
 *
 * @typedef GameRendererLike
 * @property {(ctx: RenderingContext) => Promise<void>} [prepare]
 * @property {(ctx: RenderingContext) => Promise<void>} [dispose]
 * @property {(ctx: RenderingContext) => void} render
 */

export class Game {
  /**
   * @param {RenderingContext} renderContext
   * @param {InputContext} inputContext
   */
  constructor(renderContext, inputContext) {
    /**
     * @private
     * @type {Array<GameSystemLike>}
     */
    this.systems = [];
    /**
     * @private
     * @type {Array<GameRendererLike>}
     */
    this.renderers = [];

    /** @private */
    this.renderContext = renderContext;
    /** @private */
    this.inputContext = inputContext;

    this.run = this.run.bind(this);
  }

  /**
   * @param {Array<GameSystemLike>} systems 
   * @param {Array<GameRendererLike>} renderers 
   */
  async init(systems, renderers) {
    for (let system of systems) {
      if (system.load) {
        await system.load();
      }
      this.systems.push(system);
    }
    for (let renderer of renderers) {
      if (renderer.prepare) {
        await renderer.prepare(this.renderContext);
      }
      this.renderers.push(renderer);
    }
    for (let system of this.systems) {
      if (!system.init) continue;
      system.init();
    }
  }

  /**
   * @param {AnimationFrameDetail} e
   */
  run(e) {
    this.inputContext.poll(e.currentTime);
    for (let system of this.systems) {
      if (!system.input) continue;
      system.input(this.inputContext);
    }
    for (let system of this.systems) {
      system.update(e.deltaTime);
    }
    for (let renderer of this.renderers) {
      renderer.render(this.renderContext);
    }
  }

  async stop() {
    let oldSystems = this.systems.slice();
    let oldRenderers = this.renderers.slice();

    for (let system of oldSystems) {
      if (!system.dead) continue;
      system.dead();

      let i = this.systems.indexOf(system);
      this.systems.splice(i, 1);
    }

    const renderContext = this.renderContext;
    let result = [];
    for (let renderer of oldRenderers) {
      if (!renderer.dispose) continue;
      result.push(renderer.dispose(renderContext));

      let i = this.renderers.indexOf(renderer);
      this.renderers.splice(i, 1);
    }

    for (let system of oldSystems) {
      if (!system.unload) continue;
      result.push(system.unload());
    }

    await Promise.all(result);
    this.systems.length = 0;
    this.renderers.length = 0;
  }

  getRenderContext() {
    return this.renderContext;
  }

  getInputContext() {
    return this.inputContext;
  }
}
