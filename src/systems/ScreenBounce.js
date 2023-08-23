import { ComponentClass, Query, Topic } from '@milquejs/milque';

import { Position } from './Position';
import { Velocity } from './Velocity';
import { useProvider } from '../main';
import { FrameProvider } from './FrameProvider';

export const ScreenBounce = new ComponentClass('screenBounce');

const UpdateScreenBounceQuery = new Query(ScreenBounce, Position, Velocity);

export class ScreenBounceEvent {
  /** @type {import('@milquejs/milque').EntityId} */
  entityId = 0;
}

/** @type {Topic<ScreenBounceEvent>} */
export const OnScreenBounce = new Topic('screenBounce.bounce');

export class ScreenBounceConfiguration {
  minScreenX = 0;
  minScreenY = 0;
  maxScreenX = 160;
  maxScreenY = 90;
}

/**
 * @param {import('../main').World} m
 */
export function ScreenBounceSystem(m) {
  const { maxScreenX, maxScreenY, minScreenX, minScreenY } = useProvider(m, ScreenBounceConfiguration);
  const { topics } = useProvider(m, FrameProvider);

  for(let entityId of UpdateScreenBounceQuery.findEntityIds(m.ents)) {
    let position = m.ents.get(entityId, Position);
    let velocity = m.ents.get(entityId, Velocity);
    position.x += velocity.dx;
    position.y += velocity.dy;

    let flag = false;
    if (position.x < minScreenX || position.x > maxScreenX) {
      position.x = Math.min(Math.max(minScreenX, position.x), maxScreenX);
      velocity.dx *= -1;
      flag = true;
    }

    if (position.y < minScreenY || position.y > maxScreenY) {
      position.y = Math.min(Math.max(minScreenY, position.y), maxScreenY);
      velocity.dy *= -1;
      flag = true;
    }

    if (flag) {
      let e = new ScreenBounceEvent();
      e.entityId = entityId;
      OnScreenBounce.dispatch(topics, e);
    }
  }
}
