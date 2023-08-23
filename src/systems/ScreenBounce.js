import { ComponentClass, Query, Topic } from '@milquejs/milque';

import { Position } from './Position';
import { Velocity } from './Velocity';
import { useProvider } from '../main';

/** @type {Topic<ScreenBounceEvent>} */
export const ScreenBounceTopic = new Topic('screenBounce.bounce');
export class ScreenBounceEvent {
  /** @type {import('@milquejs/milque').EntityId} */
  entityId = 0;
}

export class ScreenBounceConfiguration {
  minScreenX = 0;
  minScreenY = 0;
  maxScreenX = 160;
  maxScreenY = 90;
}

export const ScreenBounce = new ComponentClass('screenBounce');
const UpdateScreenBounceQuery = new Query(ScreenBounce, Position, Velocity);

/**
 * @param {import('../main').World} m
 */
export function ScreenBounceSystem(m) {
  const { maxScreenX, maxScreenY, minScreenX, minScreenY } = useProvider(m, ScreenBounceConfiguration);

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
      ScreenBounceTopic.dispatch(m.topics, e);
    }
  }
}
