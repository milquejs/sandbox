import {
  ASTEROID_BREAK_DAMP_FACTOR,
  RAND_ASTEROID_EXPLODE_PARTICLE_COLORS,
  breakUpAsteroid,
} from './Asteroids';
import { MainScene } from './MainScene';
import { explode } from './Particles';
import { drawCollisionCircle, withinRadius, wrapAround } from './Utils';

export const BULLET_RADIUS = 2;
export const BULLET_SPEED = 4;
export const MAX_BULLET_AGE = 2000;
export const MAX_BULLET_COUNT = 100;
export const BULLET_COLOR = 'gold';

export function init() {
  return new BulletSystem();
}

export class BulletSystem {
  /** @type {Array<Bullet>} */
  entities = [];
}

/**
 * @param {BulletSystem} system
 * @param {number} dt
 * @param {MainScene} scene
 */
export function updateBullets(system, dt, scene) {
  // Update bullet motion
  for (let bullet of system.entities) {
    bullet.age += dt;
    if (bullet.age > MAX_BULLET_AGE) {
      destroyBullet(system, bullet);
    } else {
      bullet.x += bullet.dx;
      bullet.y += bullet.dy;

      // Wrap around
      wrapAround(bullet, BULLET_RADIUS * 2, BULLET_RADIUS * 2);
    }
  }

  // Update bullet collision
  for (let bullet of system.entities) {
    for (let asteroid of scene.asteroids.entities) {
      if (withinRadius(bullet, asteroid, asteroid.size)) {
        scene.flashScore = 1;
        scene.score++;
        if (scene.score > scene.highScore) {
          scene.flashHighScore = scene.score - scene.highScore;
          scene.highScore = scene.score;
          localStorage.setItem('highscore', `${scene.highScore}`);
        }
        explode(
          scene.particles,
          asteroid.x,
          asteroid.y,
          10,
          RAND_ASTEROID_EXPLODE_PARTICLE_COLORS,
        );
        // Assets.SoundPop.current.play();
        destroyBullet(system, bullet);
        breakUpAsteroid(
          scene.asteroids,
          asteroid,
          bullet.dx * ASTEROID_BREAK_DAMP_FACTOR,
          bullet.dy * ASTEROID_BREAK_DAMP_FACTOR,
        );
        break;
      }
    }
  }
}

/**
 * @param {BulletSystem} system
 * @param {CanvasRenderingContext2D} ctx
 */
export function drawBullets(system, ctx) {
  // Draw bullet
  for (let bullet of system.entities) {
    ctx.translate(bullet.x, bullet.y);
    ctx.rotate(bullet.rotation);
    ctx.fillStyle = BULLET_COLOR;
    ctx.fillRect(
      -BULLET_RADIUS,
      -BULLET_RADIUS,
      BULLET_RADIUS * 4,
      BULLET_RADIUS * 2,
    );
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    drawCollisionCircle(ctx, bullet.x, bullet.y, BULLET_RADIUS);
  }
}

export class Bullet {
  x = 0;
  y = 0;
  dx = 0;
  dy = 0;
  rotation = 0;
  age = 0;
}

/**
 * @param {BulletSystem} system
 * @param {number} x
 * @param {number} y
 * @param {number} dx
 * @param {number} dy
 */
export function spawnBullet(system, x, y, dx, dy) {
  let result = new Bullet();
  result.x = x;
  result.y = y;
  result.dx = dx;
  result.dy = dy;
  result.rotation = Math.atan2(dy, dx);
  system.entities.push(result);
  return result;
}

/**
 * @param {BulletSystem} system
 * @param {Bullet} bullet
 */
export function destroyBullet(system, bullet) {
  system.entities.splice(system.entities.indexOf(bullet), 1);
}

/**
 * @param {BulletSystem} system
 */
export function countBullets(system) {
  return system.entities.length;
}

/**
 * @param {BulletSystem} system
 */
export function onNextLevel(system) {
  system.entities.length = 0;
}
