import { WORLD_UPDATE, WORLD_RENDER } from '../index';

export const BOX_SIZE = 64;

/**
 * @param {import('../index.js').World} world 
 */
export function Box(world) {
  WORLD_UPDATE.on(world.topics, 0, onUpdate);
  WORLD_RENDER.on(world.topics, 1, onRender);
  return {
    x: 0,
    y: 0,
    dx: 1,
    dy: 1,
  };
}

/** @type {import('@milquejs/milque').TopicCallback<import('../index.js').World>} */
function onUpdate(world) {
  const { display } = world;
  const box = world.systems.get(Box);
  box.x += box.dx;
  box.y += box.dy;

  if (box.x < 0 || box.x > display.width) {
    box.x = Math.min(Math.max(0, box.x), display.width);
    box.dx *= -1;
  }

  if (box.y < 0 || box.y > display.height) {
    box.y = Math.min(Math.max(0, box.y), display.height);
    box.dy *= -1;
  }
}

/** @type {import('@milquejs/milque').TopicCallback<import('../index.js').World>} */
function onRender(world) {
  const { ctx, tia } = world;
  const box = world.systems.get(Box);
  tia.rectFill(ctx, box.x - BOX_SIZE / 2, box.y - BOX_SIZE / 2, box.x + BOX_SIZE / 2, box.y + BOX_SIZE / 2, 0xFF0000);
}
