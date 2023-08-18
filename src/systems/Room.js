import { WORLD_RENDER } from '..';
import { drawGlyph } from './Spells';

/**
 * @param {import('../index.js').World} world
 */
export function Room(world) {
  const state = '';

  WORLD_RENDER.on(world.topics, 10, onRender);
  return {
    state,
  };
}

/** @type {import('@milquejs/milque').TopicCallback<import('../index.js').World>} */
function onRender(world) {
  const room = world.systems.get(Room);
  const { ctx, tia } = world;
  switch(room.state) {
    case 'win':
      drawGlyph(ctx, tia, world.display.width / 2, world.display.height / 2, 'WIN');
      break;
    case 'lose':
      drawGlyph(ctx, tia, world.display.width / 2, world.display.height / 2, 'LOSE');
      break;
  }
}
