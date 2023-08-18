import { WORLD_UPDATE, WORLD_RENDER } from '../index';
import { drawSpriteUV } from './SpriteUV';
import WIZARD from '../assets/wizard.png.asset';
import splatPngAsset from '@/assets/splat.png.asset';
import ghostPngAsset from '@/assets/ghost.png.asset';

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
  // tia.rectFill(ctx, box.x - BOX_SIZE / 2, box.y - BOX_SIZE / 2, box.x + BOX_SIZE / 2, box.y + BOX_SIZE / 2, 0xFF0000);

  let dt = Math.floor(world.frame?.currentTime / 100);
  // drawSpriteUV(ctx, tia, WIZARD.current, 100, 100, dt % 3, 64, 64, 3);
  // drawSpriteUV(ctx, tia, splatPngAsset.current, 100, 100, dt % 6, 80, 80, 6);
  // drawSpriteUV(ctx, tia, ghostPngAsset.current, 100, 100 - ((dt % 12) * 10), dt % 12, 32, 80, 12);
}
