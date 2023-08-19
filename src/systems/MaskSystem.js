import { Topic } from '@milquejs/milque';

import { WORLD_RENDER, WORLD_UPDATE, use, when } from '..';
import { MaskManager } from '../util/MaskManager';

export const MASK_TRIGGERS = new Topic('maskTriggers');

/**
 * @param {import('..').World} m
 */
export function MaskSystem(m) {
  let maskManager = new MaskManager();
  when(m, WORLD_UPDATE, 0, onUpdate);
  when(m, WORLD_RENDER, 0, onRender);
  return maskManager;
}

/**
 * @param {import('..').World} m
 */
function onUpdate(m) {
  const maskManager = use(m, MaskSystem);
  for (let result of maskManager.test()) {
    MASK_TRIGGERS.dispatch(m.topics, { ...result });
  }
}

/**
 * @param {import('..').World} m
 */
function onRender(m) {
  const { ctx, tia } = m;
  const maskManager = use(m, MaskSystem);
  for (let mask of maskManager.objects) {
    tia.rect(
      ctx,
      mask.center[0] - mask.radius[0],
      mask.center[1] - mask.radius[1],
      mask.center[0] + mask.radius[0],
      mask.center[1] + mask.radius[1],
      0x00ff00,
    );
  }
}
