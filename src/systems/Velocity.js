import { ComponentClass, Query } from '@milquejs/milque';

import { Position } from './Position';

export const Velocity = new ComponentClass('velocity', () => ({
  dx: 0,
  dy: 0,
}));

const UpdateVelocityQuery = new Query(Position, Velocity);

/**
 * @param {import('../main').World} m
 */
export function VelocitySystem(m) {
  const dt = m.frame.deltaTime / 60;
  for(let entityId of UpdateVelocityQuery.findEntityIds(m.ents)) {
    let position = m.ents.get(entityId, Position);
    let velocity = m.ents.get(entityId, Velocity);
    position.x += velocity.dx * dt;
    position.y += velocity.dy * dt;
  }
}
