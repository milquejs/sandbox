import { ButtonBinding, InputContext, KeyCodes, Random } from '@milquejs/milque';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../v1/Values';
import { BULLET_SPEED, BulletSystem, MAX_BULLET_COUNT, countBullets, spawnBullet } from './Bullets';
import { MainScene } from './MainScene';
import { ParticleSystem, explode, thrust } from './Particles';
import { drawCollisionCircle, wrapAround } from './Utils';
import { FLASH_TIME_STEP } from './Values';

export const PLAYER_UP = new ButtonBinding('up', [KeyCodes.ARROW_UP, KeyCodes.KEY_W]);
export const PLAYER_DOWN = new ButtonBinding('down', [KeyCodes.ARROW_DOWN, KeyCodes.KEY_S]);
export const PLAYER_LEFT = new ButtonBinding('left', [KeyCodes.ARROW_LEFT, KeyCodes.KEY_A]);
export const PLAYER_RIGHT = new ButtonBinding('right', [KeyCodes.ARROW_RIGHT, KeyCodes.KEY_D]);
export const PLAYER_FIRE = new ButtonBinding('fire', [KeyCodes.SPACE]);
export const PLAYER_DEBUG = new ButtonBinding('debug', [KeyCodes.BACKSLASH]);

export const PLAYER_RADIUS = 5;
export const PLAYER_DELTA_DAMP_FACTOR = 0.1;
export const PLAYER_MOVE_PARTICLE_DAMP_FACTOR = 1.5;
export const PLAYER_MOVE_SPEED = 0.02;
export const PLAYER_ROT_SPEED = 0.008;
export const PLAYER_ROT_FRICTION = 0.1;
export const PLAYER_MOVE_FRICTION = 0.001;
export const PLAYER_SHOOT_COOLDOWN = 10;

export const PLAYER_MOVE_PARTICLE_OFFSET_RANGE = [-2, 2];
export const MIN_PLAYER_MOVE_PARTICLE_LIFE_RATIO = 0.1;
export const MAX_PLAYER_MOVE_PARTICLE_LIFE_RATIO = 0.4;

export const PLAYER_EXPLODE_PARTICLE_COLORS = [
  'red',
  'red',
  'red',
  'yellow',
  'orange',
];
export const RAND_PLAYER_EXPLODE_PARTICLE_COLORS = () => {
  return Random.choose(PLAYER_EXPLODE_PARTICLE_COLORS);
};

export const PLAYER_MOVE_PARTICLE_COLORS = [
  'gray', 'darkgray', 'lightgray'
];
export const RAND_PLAYER_MOVE_PARTICLE_COLORS = () => {
  return Random.choose(PLAYER_MOVE_PARTICLE_COLORS);
};

export function init() {
  return new PlayerSystem();
}

export class PlayerSystem {
  /** @type {Array<Player>} */
  entities = [];
}

/**
 * @param {InputContext} axb 
 */
export function registerInputs(axb) {
  axb.bindKeys([
    PLAYER_UP, PLAYER_DOWN,
    PLAYER_LEFT, PLAYER_RIGHT,
    PLAYER_FIRE, PLAYER_DEBUG
  ]);
}

/**
 * @param {PlayerSystem} system 
 * @param {Player} player
 * @param {InputContext} axb
 */
export function inputPlayer(system, player, axb) {
  player.up = axb.getButtonValue('up');
  player.down = axb.getButtonValue('down');
  player.left = axb.getButtonValue('left');
  player.right = axb.getButtonValue('right');
  player.fire = axb.getButtonValue('fire');
}

/**
 * @param {PlayerSystem} system 
 * @param {number} dt 
 * @param {Player} player
 * @param {ParticleSystem} particles
 * @param {BulletSystem} bullets
 */
export function updatePlayers(system, dt, player, particles, bullets) {
  // Determine control
  const rotControl = player.right - player.left;
  const moveControl = player.down - player.up;
  const fireControl = player.fire;

  // Calculate velocity
  player.dx +=
    moveControl * Math.cos(player.rotation) * PLAYER_MOVE_SPEED;
  player.dy +=
    moveControl * Math.sin(player.rotation) * PLAYER_MOVE_SPEED;
  player.dx *= 1 - PLAYER_MOVE_FRICTION;
  player.dy *= 1 - PLAYER_MOVE_FRICTION;

  // Calculate angular velocity
  player.dr += rotControl * PLAYER_ROT_SPEED;
  player.dr *= 1 - PLAYER_ROT_FRICTION;

  // Calculate position
  player.x += player.dx * dt * PLAYER_DELTA_DAMP_FACTOR;
  player.y += player.dy * dt * PLAYER_DELTA_DAMP_FACTOR;
  player.rotation += player.dr * dt * PLAYER_DELTA_DAMP_FACTOR;

  --player.cooldown;

  // Wrap around
  wrapAround(player, PLAYER_RADIUS * 2, PLAYER_RADIUS * 2);

  // Whether to fire a bullet
  if (fireControl) {
    shoot(system, player, bullets);
    player.flashShootDelta = 1;
  }

  // Whether to spawn thruster particles
  if (moveControl) {
    thrust(
      particles,
      player.x,
      player.y,
      -moveControl *
        Math.cos(player.rotation) *
        PLAYER_MOVE_PARTICLE_DAMP_FACTOR,
      -moveControl *
        Math.sin(player.rotation) *
        PLAYER_MOVE_PARTICLE_DAMP_FACTOR,
      RAND_PLAYER_MOVE_PARTICLE_COLORS,
    );
  }
}

/**
 * @param {PlayerSystem} system 
 * @param {CanvasRenderingContext2D} ctx 
 */
export function drawPlayers(system, ctx) {
  for(let player of system.entities) {
    ctx.translate(player.x, player.y);
    ctx.rotate(player.rotation);
    ctx.fillStyle = 'white';
    let size = PLAYER_RADIUS;
    ctx.fillRect(-size, -size, size * 2, size * 2);
    let xOffset = -1;
    let yOffset = 0;
    let sizeOffset = 0;
    if (player.flashShootDelta > 0) {
      ctx.fillStyle = `rgb(${
        200 * player.flashShootDelta +
        55 * Math.sin(performance.now() / (PLAYER_SHOOT_COOLDOWN * 2))
      }, 0, 0)`;
      player.flashShootDelta -= FLASH_TIME_STEP;
      sizeOffset = player.flashShootDelta * 2;
      xOffset = player.flashShootDelta;
    } else {
      ctx.fillStyle = 'black';
    }
    ctx.fillRect(
      -size - sizeOffset / 2 + xOffset,
      -(size / 4) - sizeOffset / 2 + yOffset,
      size + sizeOffset,
      size / 2 + sizeOffset
    );
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    drawCollisionCircle(ctx, player.x, player.y, PLAYER_RADIUS);
  }
}

export class Player {
  x = 0;
  y = 0;
  rotation = 0;
  dx = 0;
  dy = 0;
  dr = 0;
  left = 0;
  right = 0;
  up = 0;
  down = 0;
  fire = 0;
  cooldown = 0;
  powerMode = 0;
  flashShoot = 0;
  flashShootDelta = 0;
}

/**
 * @param {PlayerSystem} system
 */
export function spawnPlayer(system) {
  let result = new Player();
  result.x = SCREEN_WIDTH / 2;
  result.y = SCREEN_HEIGHT / 2;
  system.entities.push(result);
  return result;
}

/**
 * @param {PlayerSystem} system 
 * @param {Player} player 
 */
export function destroyPlayer(system, player) {
  system.entities.splice(system.entities.indexOf(player), 1);
}

/**
 * @param {PlayerSystem} system
 */
export function countPlayers(system) {
  return system.entities.length;
}

/**
 * @param {PlayerSystem} system 
 * @param {Player} player 
 * @param {BulletSystem} bullets
 */
export function shoot(system, player, bullets) {
  if (countBullets(bullets) > MAX_BULLET_COUNT) return;
  if (player.cooldown > 0) return;
  if (player.powerMode > 0) {
    for (let i = -1; i <= 1; ++i) {
      let rotation = player.rotation + (i * Math.PI) / 4;
      spawnBullet(
        bullets,
        player.x - Math.cos(rotation) * PLAYER_RADIUS,
        player.y - Math.sin(rotation) * PLAYER_RADIUS,
        -Math.cos(rotation) * BULLET_SPEED + player.dx,
        -Math.sin(rotation) * BULLET_SPEED + player.dy
      );
    }
    --player.powerMode;
  } else {
    spawnBullet(
      bullets,
      player.x - Math.cos(player.rotation) * PLAYER_RADIUS,
      player.y - Math.sin(player.rotation) * PLAYER_RADIUS,
      -Math.cos(player.rotation) * BULLET_SPEED + player.dx,
      -Math.sin(player.rotation) * BULLET_SPEED + player.dy
    );
  }
  player.cooldown = PLAYER_SHOOT_COOLDOWN;
  // Assets.SoundShoot.current.play();
}

/**
 * @param {PlayerSystem} system 
 */
export function onNextLevel(system) {
  for(let player of system.entities) {
    player.x = SCREEN_WIDTH / 2;
    player.y = SCREEN_HEIGHT / 2;
    player.dx = 0;
    player.dy = 0;
  }
}

/**
 * @param {PlayerSystem} system 
 */
export function onGameRestart(system) {
  for(let player of system.entities) {
    player.powerMode = 0;
  }
}

/**
 * @param {MainScene} scene 
 * @param {Player} player
 */
export function killPlayer(scene, player) {
  scene.gamePause = true;
  scene.showPlayer = false;
  explode(
    scene.particles,
    player.x,
    player.y,
    100,
    RAND_PLAYER_EXPLODE_PARTICLE_COLORS,
  );
  // Assets.SoundDead.current.play();
  // Assets.SoundBoom.current.play();
  setTimeout(() => (scene.gameStart = scene.gameWait = true), 1000);
}
