import { WORLD_RENDER } from '../index.js';

export class Camera {

  /** @param {import('../index.js').World} world */
  constructor(world) {
    this.cameraX = 0;
    this.cameraY = 0;

    this.onRender = this.onRender.bind(this);
    WORLD_RENDER.on(world.topics, -1, this.onRender);
  }

  /** @type {import('@milquejs/milque').TopicCallback<import('../index.js').World>} */
  onRender(world) {
    world.tia.camera(this.cameraX, this.cameraY, world.display.width, world.display.height);
  }
}
