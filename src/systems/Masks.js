/** @typedef {ReturnType<createMask>} Mask */

import { WORLD_RENDER, WORLD_UPDATE } from '..';

/**
 * @param {import('..').World} world
 */
export function Masks(world) {
  /** @type {Array<Mask>} */
  let list = [];
  WORLD_RENDER.on(world.topics, 0, () => {
    const { ctx, tia } = world;
    for(let mask of list) {
      let [x1, y1, x2, y2] = mask;
      // tia.rect(ctx, x1, y1, x2, y2, 0x00FF00);
    }
  });
  return {
    list,
    spawnMask,
    despawnMask,
  };
}

/**
 * @param {import('..').World} world 
 * @param {Mask} mask 
 */
function despawnMask(world, mask) {
  const masks = world.systems.get(Masks);
  let i = masks.list.indexOf(mask);
  if (i >= 0) {
    masks.list.splice(i, 1);
    return true;
  }
  return false;
}

/**
 * @param {import('..').World} world 
 * @param {Mask} mask
 */
function spawnMask(world, mask) {
  const masks = world.systems.get(Masks);
  masks.list.push(mask);
}

/**
 * @param {number} left
 * @param {number} top
 * @param {number} right
 * @param {number} bottom
 */
export function createMask(left, top, right, bottom) {
  return [left, top, right, bottom];
}

/**
 * @param {Mask} mask
 * @param {number} x 
 * @param {number} y 
 * @param {number} dx 
 * @param {number} dy
 */
export function updateMaskPositionFromCenter(mask, x, y, dx, dy) {
  mask[0] = x - dx;
  mask[1] = y - dy;
  mask[2] = x + dx;
  mask[3] = y + dy;
  return mask;
}
