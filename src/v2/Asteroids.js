import { Random } from '@milquejs/milque';
import { MainScene } from './MainScene';
import { ParticleSystem, explode } from './Particles';
import { drawCollisionCircle, withinRadius, wrapAround } from './Utils';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../v1/Values';
import { PLAYER_RADIUS, killPlayer } from './Players';

export const SMALL_ASTEROID_RADIUS = 4;
export const ASTEROID_BREAK_DAMP_FACTOR = 0.1;

export const ASTEROID_EXPLODE_PARTICLE_COLORS = [
  'blue',
  'blue',
  'blue',
  'dodgerblue',
  'gray',
  'darkgray',
  'yellow',
];
export const RAND_ASTEROID_EXPLODE_PARTICLE_COLORS = () => {
  return Random.choose(ASTEROID_EXPLODE_PARTICLE_COLORS);
};

export const ASTEROID_RADIUS = 8;
export const ASTEROID_SPAWN_RANGES = [
  [
    -ASTEROID_RADIUS,
    -ASTEROID_RADIUS,
    ASTEROID_RADIUS * 2 + SCREEN_WIDTH,
    ASTEROID_RADIUS,
  ],
  [-ASTEROID_RADIUS, 0, ASTEROID_RADIUS, SCREEN_HEIGHT],
  [
    -ASTEROID_RADIUS,
    SCREEN_HEIGHT,
    ASTEROID_RADIUS * 2 + SCREEN_WIDTH,
    ASTEROID_RADIUS,
  ],
  [SCREEN_WIDTH, 0, ASTEROID_RADIUS, SCREEN_HEIGHT],
];
export const ASTEROID_SPAWN_RATE = [3000, 10000];
export const ASTEROID_SPAWN_INIT_COUNT = 1;
export const MAX_ASTEROID_COUNT = 100;
export const ASTEROID_SPEED = 1;

export function init() {
  return new AsteroidSystem();
}

export class AsteroidSystem {
  /** @type {Array<Asteroid>} */
  entities = [];
  spawner = new AsteroidSpawner();
}

class AsteroidSpawner {
  spawnTicks = ASTEROID_SPAWN_RATE[1];

  /**
   * @param {AsteroidSystem} system
   */
  spawn(system) {
    if (countAsteroids(system) > MAX_ASTEROID_COUNT) {
      return;
    }
    let spawnRange = Random.choose(ASTEROID_SPAWN_RANGES);
    spawnAsteroid(
      system,
      // X range
      Random.range(spawnRange[0], spawnRange[0] + spawnRange[2]),
      // Y range
      Random.range(spawnRange[1], spawnRange[1] + spawnRange[3]),
      Random.range(-ASTEROID_SPEED, ASTEROID_SPEED),
      Random.range(-ASTEROID_SPEED, ASTEROID_SPEED),
      ASTEROID_RADIUS
    );
  }

  reset() {
    this.spawnTicks = ASTEROID_SPAWN_RATE[1];
  }

  /**
   * @param {number} dt 
   * @param {MainScene} scene
   */
  update(dt, scene) {
    if (scene.gamePause) {
      return;
    }
    this.spawnTicks -= dt;
    if (this.spawnTicks <= 0) {
      this.spawn(scene.asteroids);
      this.spawnTicks = Random.range(ASTEROID_SPAWN_RATE[0], ASTEROID_SPAWN_RATE[1]);
    }
  }
}

/**
 * @param {AsteroidSystem} system 
 * @param {number} dt 
 * @param {any} player
 * @param {MainScene} scene
 * @param {ParticleSystem} particles
 */
export function updateAsteroids(system, dt, player, scene, particles) {
  // Update asteroid motion
  for (let asteroid of system.entities) {
    asteroid.x += asteroid.dx;
    asteroid.y += asteroid.dy;

    // Wrap around
    wrapAround(asteroid, asteroid.size * 2, asteroid.size * 2);
  }

  // Update asteroid collision
  for (let asteroid of system.entities) {
    if (withinRadius(asteroid, player, asteroid.size + PLAYER_RADIUS)) {
      explode(
        particles,
        asteroid.x,
        asteroid.y,
        10,
        RAND_ASTEROID_EXPLODE_PARTICLE_COLORS,
      );
      destroyAsteroid(system, asteroid);
      killPlayer(scene, scene.player);
      break;
    }
  }

  // Update spawner
  system.spawner.update(dt, scene);
}

/**
 * @param {AsteroidSystem} system 
 * @param {CanvasRenderingContext2D} ctx 
 */
export function drawAsteroids(system, ctx) {
  // Draw asteroid
  for (let asteroid of system.entities) {
    ctx.translate(asteroid.x, asteroid.y);
    ctx.rotate(asteroid.rotation);
    ctx.fillStyle = 'slategray';
    ctx.fillRect(
      -asteroid.size,
      -asteroid.size,
      asteroid.size * 2,
      asteroid.size * 2
    );
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    drawCollisionCircle(ctx, asteroid.x, asteroid.y, asteroid.size);
  }
}

export class Asteroid {
  x = 0;
  y = 0;
  dx = 0;
  dy = 0;
  rotation = 0;
  size = 0;
}

/**
 * @param {AsteroidSystem} system 
 * @param {number} x 
 * @param {number} y 
 * @param {number} dx 
 * @param {number} dy
 * @param {number} size
 */
export function spawnAsteroid(system, x, y, dx, dy, size) {
  let result = new Asteroid();
  result.x = x;
  result.y = y;
  result.dx = dx;
  result.dy = dy;
  result.size = size;
  result.rotation = Math.atan2(dy, dx);
  system.entities.push(result);
  return result;
}

/**
 * @param {AsteroidSystem} system 
 * @param {Asteroid} asteroid 
 */
export function destroyAsteroid(system, asteroid) {
  system.entities.splice(system.entities.indexOf(asteroid), 1);
}

/**
 * @param {AsteroidSystem} system
 */
export function countAsteroids(system) {
  return system.entities.length;
}

/**
 * @param {AsteroidSystem} system 
 * @param {Asteroid} asteroid 
 * @param {number} dx
 * @param {number} dy
 */
export function breakUpAsteroid(system, asteroid, dx = 0, dy = 0) {
  destroyAsteroid(system, asteroid);
  if (asteroid.size <= SMALL_ASTEROID_RADIUS) {
    return;
  }
  spawnAsteroid(
    system,
    asteroid.x + Random.range(-ASTEROID_RADIUS, ASTEROID_RADIUS),
    asteroid.y + Random.range(-ASTEROID_RADIUS, ASTEROID_RADIUS),
    Random.range(-ASTEROID_SPEED, ASTEROID_SPEED) + dx,
    Random.range(-ASTEROID_SPEED, ASTEROID_SPEED) + dy,
    SMALL_ASTEROID_RADIUS
  );
  spawnAsteroid(
    system,
    asteroid.x + Random.range(-ASTEROID_RADIUS, ASTEROID_RADIUS),
    asteroid.y + Random.range(-ASTEROID_RADIUS, ASTEROID_RADIUS),
    Random.range(-ASTEROID_SPEED, ASTEROID_SPEED) + dx,
    Random.range(-ASTEROID_SPEED, ASTEROID_SPEED) + dy,
    SMALL_ASTEROID_RADIUS
  );
  spawnAsteroid(
    system,
    asteroid.x + Random.range(-ASTEROID_RADIUS, ASTEROID_RADIUS),
    asteroid.y + Random.range(-ASTEROID_RADIUS, ASTEROID_RADIUS),
    Random.range(-ASTEROID_SPEED, ASTEROID_SPEED) + dx,
    Random.range(-ASTEROID_SPEED, ASTEROID_SPEED) + dy,
    SMALL_ASTEROID_RADIUS
  );
  spawnAsteroid(
    system,
    asteroid.x + Random.range(-ASTEROID_RADIUS, ASTEROID_RADIUS),
    asteroid.y + Random.range(-ASTEROID_RADIUS, ASTEROID_RADIUS),
    Random.range(-ASTEROID_SPEED, ASTEROID_SPEED) + dx,
    Random.range(-ASTEROID_SPEED, ASTEROID_SPEED) + dy,
    SMALL_ASTEROID_RADIUS
  );
}

/**
 * @param {AsteroidSystem} system 
 */
export function onGameRestart(system) {
  system.spawner.reset();
}

/**
 * @param {AsteroidSystem} system 
 * @param {MainScene} scene
 */
export function onNextLevel(system, scene) {
  system.entities.length = 0;

  for (let i = 0; i < ASTEROID_SPAWN_INIT_COUNT * scene.level; ++i) {
    system.spawner.spawn(system);
  }
}
