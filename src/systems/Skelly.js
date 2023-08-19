import { Archetype, ComponentClass } from '@milquejs/milque';

import { use } from '..';
import { ObjectPool } from '../util/ObjectPool';

const Skelly = new ComponentClass('skelly', () => ({
  x: 0,
  y: 0,
  dx: 0,
  dy: 0,
  spriteIndex: 0,
}));
const SkellyArchetype = new Archetype({
  skelly: Skelly,
});

/**
 * @param {import('..').World} m
 */
export function Skellies(m) {
  const objects = new ObjectPool(100, createSkelly);
  return {
    objects,
  };
}

function createSkelly() {
  return {
    x: 0,
    y: 0,
    spriteIndex: 0,
  };
}

/** @param {import('..').World} m */
function onUpdate(m) {
  const skellies = use(m, Skellies);
  for (let obj of skellies.objects) {
  }
}

/** @param {import('..').World} */
function onRender(m) {
  for (let { skelly } of SkellyArchetype.findAll(m.ents)) {
    skelly.x += skelly.dx;
    skelly.y += skelly.dy;
  }
}
