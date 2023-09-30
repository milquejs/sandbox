export class Renderer {
  /**
   * @protected
   * @type {RenderingContext|null}
   */
  ctx = null;

  /**
   * @abstract
   * @param {RenderingContext} ctx
   */
  async prepare(ctx) {
    if (this.ctx !== null) {
      throw new Error(
        `Cannot perform prepare for already-prepared rendering context '${this.ctx}' - going to prepare '${ctx}'.`,
      );
    }
    this.ctx = ctx;
  }

  /**
   * @abstract
   * @param {RenderingContext} ctx
   */
  async dispose(ctx) {
    if (ctx !== this.ctx) {
      throw new Error(
        `Cannot perform dispose for un-prepared rendering context '${ctx}' - had prepared '${this.ctx}'.`,
      );
    }
    this.ctx = null;
  }

  /**
   * @abstract
   * @param {RenderingContext} ctx
   */
  render(ctx) {
    if (ctx !== this.ctx) {
      throw new Error(
        `Cannot perform render for un-prepared rendering context '${ctx}' - had prepared '${this.ctx}'.`,
      );
    }
  }
}
