import { Random } from '@milquejs/milque';

import {
  MAX_PLAYER_MOVE_PARTICLE_LIFE_RATIO,
  MIN_PLAYER_MOVE_PARTICLE_LIFE_RATIO,
  PLAYER_MOVE_PARTICLE_OFFSET_RANGE,
} from './Players';
import { wrapAround } from './Utils';

export const PARTICLE_RADIUS = 4;
export const PARTICLE_SPEED = 2;
export const MAX_PARTICLE_AGE = 600;

export function init() {
  return new ParticleSystem();
}

export class ParticleSystem {
  /** @type {Array<Particle>} */
  entities = [];
}

/**
 * @param {ParticleSystem} system
 * @param {number} dt
 */
export function updateParticles(system, dt) {
  // Update particle motion
  for (let particle of system.entities) {
    particle.age += dt;
    if (particle.age > MAX_PARTICLE_AGE) {
      destroyParticle(system, particle);
    } else {
      particle.x += particle.dx;
      particle.y += particle.dy;

      // Wrap around
      wrapAround(particle, PARTICLE_RADIUS * 2, PARTICLE_RADIUS * 2);
    }
  }
}

/**
 * @param {ParticleSystem} system
 * @param {CanvasRenderingContext2D} ctx
 */
export function drawParticles(system, ctx) {
  for (let particle of system.entities) {
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);
    ctx.fillStyle = particle.color;
    let size = PARTICLE_RADIUS * (1 - particle.age / MAX_PARTICLE_AGE);
    ctx.fillRect(-size, -size, size * 2, size * 2);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}

/**
 * @param {ParticleSystem} system
 */
export function onNextLevel(system) {
  system.entities.length = 0;
}

export class Particle {
  x = 0;
  y = 0;
  dx = 0;
  dy = 0;
  rotation = 0;
  age = 0;
  color = 'white';
}

/**
 * @param {ParticleSystem} system
 * @param {number} x
 * @param {number} y
 * @param {number} dx
 * @param {number} dy
 * @param {(() => string)|string} color
 */
export function spawnParticle(system, x, y, dx, dy, color) {
  if (typeof color === 'function') color = color.call(undefined);
  let result = new Particle();
  result.x = x;
  result.y = y;
  result.dx = dx;
  result.dy = dy;
  result.rotation = Math.atan2(dy, dx);
  result.color = color;
  system.entities.push(result);
  return result;
}

/**
 * @param {ParticleSystem} system
 * @param {Particle} particle
 */
export function destroyParticle(system, particle) {
  system.entities.splice(system.entities.indexOf(particle), 1);
}

/**
 * @param {ParticleSystem} system
 * @param {number} x
 * @param {number} y
 * @param {number} amount
 * @param {(() => string)|string} color
 */
export function explode(system, x, y, amount = 10, color) {
  for (let i = 0; i < amount; ++i) {
    spawnParticle(
      system,
      x,
      y,
      Random.range(-1, 1) * PARTICLE_SPEED,
      Random.range(-1, 1) * PARTICLE_SPEED,
      color,
    );
  }
}

/**
 * @param {ParticleSystem} particles
 * @param {number} x
 * @param {number} y
 * @param {number} dx
 * @param {number} dy
 * @param {(() => string)|string} color
 */
export function thrust(particles, x, y, dx, dy, color) {
  if (Random.next() > 0.3) {
    let particle = spawnParticle(
      particles,
      x +
        Random.range(
          PLAYER_MOVE_PARTICLE_OFFSET_RANGE[0],
          PLAYER_MOVE_PARTICLE_OFFSET_RANGE[1],
        ),
      y +
        Random.range(
          PLAYER_MOVE_PARTICLE_OFFSET_RANGE[0],
          PLAYER_MOVE_PARTICLE_OFFSET_RANGE[1],
        ),
      dx,
      dy,
      color,
    );
    particle.age = Random.range(
      MAX_PARTICLE_AGE * MIN_PLAYER_MOVE_PARTICLE_LIFE_RATIO,
      MAX_PARTICLE_AGE * MAX_PLAYER_MOVE_PARTICLE_LIFE_RATIO,
    );
  }
}
