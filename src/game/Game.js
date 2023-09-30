import { AnimationFrameDetail, InputContext } from '@milquejs/milque';

/**
 * @typedef GameSystemLike
 * @property {() => Promise<void>} [load]
 * @property {() => Promise<void>} [unload]
 * @property {() => void} [init]
 * @property {() => void} [dead]
 * @property {(axb: InputContext) => void} input
 * @property {(dt: number) => void} update
 *
 * @typedef GameRendererLike
 * @property {(ctx: RenderingContext) => Promise<void>} [prepare]
 * @property {(ctx: RenderingContext) => Promise<void>} [dispose]
 * @property {(ctx: RenderingContext) => void} render
 */

export class Game {
  /**
   * @param {Array<GameSystemLike>} systems
   * @param {Array<GameRendererLike>} renderers
   * @param {RenderingContext} renderContext
   * @param {InputContext} inputContext
   */
  constructor(systems, renderers, renderContext, inputContext) {
    /** @private */
    this.systems = systems;
    /** @private */
    this.renderers = renderers;

    /** @private */
    this.renderContext = renderContext;
    /** @private */
    this.inputContext = inputContext;

    this.run = this.run.bind(this);
  }

  async init() {
    for (let system of this.systems) {
      if (!system.load) continue;
      await system.load();
    }
    for (let renderer of this.renderers) {
      if (!renderer.prepare) continue;
      await renderer.prepare(this.renderContext);
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
    for (let system of this.systems) {
      if (!system.dead) continue;
      system.dead();
    }
    const renderContext = this.renderContext;
    let result = [];
    for (let renderer of this.renderers) {
      if (!renderer.dispose) continue;
      result.push(renderer.dispose(renderContext));
    }
    for (let system of this.systems) {
      if (!system.unload) continue;
      result.push(system.unload());
    }
    await Promise.all(result);
  }
}
