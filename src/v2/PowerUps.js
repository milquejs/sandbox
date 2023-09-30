import { Random } from '@milquejs/milque';
import { drawCollisionCircle, withinRadius, wrapAround } from './Utils';
import { ParticleSystem, explode } from './Particles';
import { ASTEROID_SPAWN_RANGES, ASTEROID_SPEED } from './Asteroids';
import { PLAYER_RADIUS } from './Players';

export const POWER_UP_SPAWN_RATE = [10000, 30000];
export const POWER_UP_RADIUS = 4;
export const POWER_UP_EXPLODE_PARTICLE_COLORS = ['white', 'violet', 'violet'];
export const RAND_POWER_UP_EXPLODE_PARTICLE_COLORS = () => {
  return Random.choose(POWER_UP_EXPLODE_PARTICLE_COLORS);
};
export const POWER_UP_AMOUNT = 30;
export const POWER_UP_SPAWN_CHANCE = 0.7;

export function init() {
  return new PowerUpSystem();
}

export class PowerUpSystem {
  /** @type {Array<PowerUp>} */
  entities = [];
}

/**
 * @param {PowerUpSystem} system 
 * @param {number} dt 
 * @param {any} player 
 * @param {ParticleSystem} particles 
 */
export function updatePowerUps(system, dt, player, particles) {
  // Update power-up motion
  for (let powerUp of system.entities) {
    powerUp.x += powerUp.dx;
    powerUp.y += powerUp.dy;

    // Wrap around
    wrapAround(powerUp, POWER_UP_RADIUS * 2, POWER_UP_RADIUS * 2);
  }

  // Update power-up collision
  for (let powerUp of system.entities) {
    if (withinRadius(powerUp, player, POWER_UP_RADIUS + PLAYER_RADIUS)) {
      explode(
        particles,
        powerUp.x,
        powerUp.y,
        10,
        RAND_POWER_UP_EXPLODE_PARTICLE_COLORS
      );
      destroyPowerUp(system, powerUp);
      player.powerMode += POWER_UP_AMOUNT;
      break;
    }
  }
}

/**
 * @param {PowerUpSystem} system 
 * @param {CanvasRenderingContext2D} ctx 
 */
export function drawPowerUps(system, ctx) {
  // Draw power-up
  for (let powerUp of system.entities) {
    ctx.translate(powerUp.x, powerUp.y);
    ctx.rotate(powerUp.rotation);
    ctx.beginPath();
    ctx.strokeStyle = 'violet';
    ctx.arc(0, 0, POWER_UP_RADIUS, 0, Math.PI * 2);
    ctx.moveTo(-POWER_UP_RADIUS / 2, 0);
    ctx.lineTo(POWER_UP_RADIUS / 2, 0);
    ctx.moveTo(0, -POWER_UP_RADIUS / 2);
    ctx.lineTo(0, POWER_UP_RADIUS / 2);
    ctx.stroke();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    drawCollisionCircle(ctx, powerUp.x, powerUp.y, POWER_UP_RADIUS);
  }
}

export class PowerUp {
  x = 0;
  y = 0;
  dx = 0;
  dy = 0;
  rotation = 0;
}

/**
 * @param {PowerUpSystem} system
 * @param {number} x 
 * @param {number} y 
 * @param {number} dx 
 * @param {number} dy
 */
export function spawnPowerUp(system, x, y, dx, dy) {
  let result = new PowerUp();
  result.x = x;
  result.y = y;
  result.dx = dx;
  result.dy = dy;
  result.rotation = Math.atan2(dy, dx);
  system.entities.push(result);
  return result;
}

/**
 * @param {PowerUpSystem} system 
 */
export function spawnRandomly(system) {
  let spawnRange = Random.choose(ASTEROID_SPAWN_RANGES);
  return spawnPowerUp(system,
    // X range
    Random.range(spawnRange[0], spawnRange[0] + spawnRange[2]),
    // Y range
    Random.range(spawnRange[1], spawnRange[1] + spawnRange[3]),
    Random.range(-ASTEROID_SPEED, ASTEROID_SPEED),
    Random.range(-ASTEROID_SPEED, ASTEROID_SPEED)
  );
}

/**
 * @param {PowerUpSystem} system 
 * @param {PowerUp} powerUp 
 */
export function destroyPowerUp(system, powerUp) {
  let i = system.entities.indexOf(powerUp);
  system.entities.splice(i, 1);
}

/**
 * @param {PowerUpSystem} system 
 */
export function onNextLevel(system) {
  if (Random.next() > POWER_UP_SPAWN_CHANCE) {
    spawnRandomly(system);
  }
}

/**
 * @param {PowerUpSystem} system 
 */
export function onGameRestart(system) {
  system.entities.length = 0;
}
