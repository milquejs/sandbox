import { ButtonBinding, InputContext, KeyCodes, Random } from '@milquejs/milque';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from './Values';
import * as Starfield from './Starfield';

const PLAYER_UP = new ButtonBinding('up', [KeyCodes.ARROW_UP, KeyCodes.KEY_W]);
const PLAYER_DOWN = new ButtonBinding('down', [KeyCodes.ARROW_DOWN, KeyCodes.KEY_S]);
const PLAYER_LEFT = new ButtonBinding('left', [KeyCodes.ARROW_LEFT, KeyCodes.KEY_A]);
const PLAYER_RIGHT = new ButtonBinding('right', [KeyCodes.ARROW_RIGHT, KeyCodes.KEY_D]);
const PLAYER_FIRE = new ButtonBinding('fire', [KeyCodes.SPACE]);
const PLAYER_DEBUG = new ButtonBinding('debug', [KeyCodes.BACKSLASH]);

const PLAYER_RADIUS = 5;
const SMALL_ASTEROID_RADIUS = 4;
const ASTEROID_RADIUS = 8;
const ASTEROID_SPAWN_RANGES = [
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
const ASTEROID_SPAWN_RATE = [3000, 10000];
const ASTEROID_SPAWN_INIT_COUNT = 1;
const MAX_ASTEROID_COUNT = 100;
const ASTEROID_SPEED = 1;
const BULLET_RADIUS = 2;
const BULLET_SPEED = 4;
const MAX_BULLET_AGE = 2000;
const MAX_BULLET_COUNT = 100;
const PLAYER_SHOOT_COOLDOWN = 10;
const PARTICLE_RADIUS = 4;
const PARTICLE_SPEED = 2;
const MAX_PARTICLE_AGE = 600;
const ASTEROID_BREAK_DAMP_FACTOR = 0.1;
const PLAYER_EXPLODE_PARTICLE_COLORS = [
  'red',
  'red',
  'red',
  'yellow',
  'orange',
];
const RAND_PLAYER_EXPLODE_PARTICLE_COLORS = () => {
  return Random.choose(PLAYER_EXPLODE_PARTICLE_COLORS);
};
const ASTEROID_EXPLODE_PARTICLE_COLORS = [
  'blue',
  'blue',
  'blue',
  'dodgerblue',
  'gray',
  'darkgray',
  'yellow',
];
const RAND_ASTEROID_EXPLODE_PARTICLE_COLORS = () => {
  return Random.choose(ASTEROID_EXPLODE_PARTICLE_COLORS);
};
const PLAYER_MOVE_PARTICLE_COLORS = [
  'gray', 'darkgray', 'lightgray'
];
const RAND_PLAYER_MOVE_PARTICLE_COLORS = () => {
  return Random.choose(PLAYER_MOVE_PARTICLE_COLORS);
};
const INSTRUCTION_HINT_TEXT = '[ wasd_ ]';
const PLAYER_MOVE_PARTICLE_OFFSET_RANGE = [-2, 2];
const PLAYER_MOVE_PARTICLE_DAMP_FACTOR = 1.5;
const MIN_PLAYER_MOVE_PARTICLE_LIFE_RATIO = 0.1;
const MAX_PLAYER_MOVE_PARTICLE_LIFE_RATIO = 0.4;
const FLASH_TIME_STEP = 0.1;

const PLAYER_MOVE_SPEED = 0.02;
const PLAYER_ROT_SPEED = 0.008;
const PLAYER_ROT_FRICTION = 0.1;
const PLAYER_MOVE_FRICTION = 0.001;

const BULLET_COLOR = 'gold';

const POWER_UP_SPAWN_RATE = [10000, 30000];
const POWER_UP_RADIUS = 4;
const POWER_UP_EXPLODE_PARTICLE_COLORS = ['white', 'violet', 'violet'];
const RAND_POWER_UP_EXPLODE_PARTICLE_COLORS = () => {
  return Random.choose(POWER_UP_EXPLODE_PARTICLE_COLORS);
};
const POWER_UP_AMOUNT = 30;
const POWER_UP_SPAWN_CHANCE = 0.7;

let SHOW_COLLISION = false;

export class MainScene {

  isFirstInput = true;

  level = 0;
  score = 0;
  highScore = Number(localStorage.getItem('highscore'));

  flashScore = 0;
  flashScoreDelta = 0;

  flashHighScore = 0;
  flashHighScoreDelta = 0;

  flashShoot = 0;
  flashShootDelta = 0;

  gamePause = true;
  showPlayer = true;
  gameStart = true;
  gameWait = true;
  hint = INSTRUCTION_HINT_TEXT;

  constructor() {
    this.player = {
      scene: this,
      x: SCREEN_WIDTH / 2,
      y: SCREEN_HEIGHT / 2,
      rotation: 0,
      dx: 0,
      dy: 0,
      dr: 0,
      left: 0,
      right: 0,
      up: 0,
      down: 0,
      fire: 0,
      cooldown: 0,
      powerMode: 0,
      shoot() {
        if (this.scene.bullets.length > MAX_BULLET_COUNT) return;
        if (this.cooldown > 0) return;
        if (this.powerMode > 0) {
          for (let i = -1; i <= 1; ++i) {
            let rotation = this.rotation + (i * Math.PI) / 4;
            let bullet = createBullet(
              this.scene,
              this.x - Math.cos(rotation) * PLAYER_RADIUS,
              this.y - Math.sin(rotation) * PLAYER_RADIUS,
              -Math.cos(rotation) * BULLET_SPEED + this.dx,
              -Math.sin(rotation) * BULLET_SPEED + this.dy
            );
            this.scene.bullets.push(bullet);
          }
          --this.powerMode;
        } else {
          let bullet = createBullet(
            this.scene,
            this.x - Math.cos(this.rotation) * PLAYER_RADIUS,
            this.y - Math.sin(this.rotation) * PLAYER_RADIUS,
            -Math.cos(this.rotation) * BULLET_SPEED + this.dx,
            -Math.sin(this.rotation) * BULLET_SPEED + this.dy
          );
          this.scene.bullets.push(bullet);
        }
        this.cooldown = PLAYER_SHOOT_COOLDOWN;
        // Assets.SoundShoot.current.play();
      },
    };

    /** @type {Array<ReturnType<createAsteroid>>} */
    this.asteroids = [];
    this.asteroidSpawner = {
      scene: this,
      spawnTicks: ASTEROID_SPAWN_RATE[1],
      reset() {
        this.spawnTicks = ASTEROID_SPAWN_RATE[1];
      },
      spawn() {
        if (this.scene.asteroids.length > MAX_ASTEROID_COUNT) return;
        let spawnRange = Random.choose(ASTEROID_SPAWN_RANGES);
        let asteroid = createAsteroid(
          this.scene,
          // X range
          Random.range(spawnRange[0], spawnRange[0] + spawnRange[2]),
          // Y range
          Random.range(spawnRange[1], spawnRange[1] + spawnRange[3]),
          Random.range(-ASTEROID_SPEED, ASTEROID_SPEED),
          Random.range(-ASTEROID_SPEED, ASTEROID_SPEED),
          ASTEROID_RADIUS
        );
        this.scene.asteroids.push(asteroid);
      },
      /**
       * @param {number} dt 
       */
      update(dt) {
        if (!this.scene.gamePause) {
          this.spawnTicks -= dt;
          if (this.spawnTicks <= 0) {
            this.spawn();
            this.spawnTicks = Random.range(ASTEROID_SPAWN_RATE[0], ASTEROID_SPAWN_RATE[1]);
          }
        }
      },
    };

    /** @type {Array<ReturnType<createBullet>>} */
    this.bullets = [];
    /** @type {Array<ReturnType<createParticle>>} */
    this.particles = [];

    /** @type {Array<ReturnType<createPowerUp>>} */
    this.powerUps = [];
    this.powerUpSpawner = {
      scene: this,
      reset() {
        // Do nothing.
      },
      spawn() {
        let spawnRange = Random.choose(ASTEROID_SPAWN_RANGES);
        let powerUp = createPowerUp(
          this.scene,
          // X range
          Random.range(spawnRange[0], spawnRange[0] + spawnRange[2]),
          // Y range
          Random.range(spawnRange[1], spawnRange[1] + spawnRange[3]),
          Random.range(-ASTEROID_SPEED, ASTEROID_SPEED),
          Random.range(-ASTEROID_SPEED, ASTEROID_SPEED)
        );
        this.scene.powerUps.push(powerUp);
      },
      /**
       * @param {number} dt 
       */
      update(dt) {
        // Do nothing.
      },
    };

    this.starfield = Starfield.createStarfield(SCREEN_WIDTH, SCREEN_HEIGHT);
  }

  /**
   * @param {number} dt 
   */
  update(dt) {
    if (this.gamePause) {
      // Update particle motion
      for (let particle of this.particles) {
        particle.age += dt;
        if (particle.age > MAX_PARTICLE_AGE) {
          particle.destroy();
        } else {
          particle.x += particle.dx;
          particle.y += particle.dy;
  
          // Wrap around
          wrapAround(particle, PARTICLE_RADIUS * 2, PARTICLE_RADIUS * 2);
        }
      }
  
      return;
    }
  
    // Determine control
    const rotControl = this.player.right - this.player.left;
    const moveControl = this.player.down - this.player.up;
    const fireControl = this.player.fire;
  
    // Calculate velocity
    this.player.dx +=
      moveControl * Math.cos(this.player.rotation) * PLAYER_MOVE_SPEED;
    this.player.dy +=
      moveControl * Math.sin(this.player.rotation) * PLAYER_MOVE_SPEED;
    this.player.dx *= 1 - PLAYER_MOVE_FRICTION;
    this.player.dy *= 1 - PLAYER_MOVE_FRICTION;
  
    // Calculate angular velocity
    this.player.dr += rotControl * PLAYER_ROT_SPEED;
    this.player.dr *= 1 - PLAYER_ROT_FRICTION;
  
    // Calculate position
    this.player.x += this.player.dx;
    this.player.y += this.player.dy;
    this.player.rotation += this.player.dr;
  
    --this.player.cooldown;
  
    // Wrap around
    wrapAround(this.player, PLAYER_RADIUS * 2, PLAYER_RADIUS * 2);
  
    // Whether to fire a bullet
    if (fireControl) {
      this.player.shoot();
      this.flashShootDelta = 1;
    }
  
    // Whether to spawn thruster particles
    if (moveControl) {
      thrust(
        this,
        this.player.x,
        this.player.y,
        -moveControl *
          Math.cos(this.player.rotation) *
          PLAYER_MOVE_PARTICLE_DAMP_FACTOR,
        -moveControl *
          Math.sin(this.player.rotation) *
          PLAYER_MOVE_PARTICLE_DAMP_FACTOR,
        RAND_PLAYER_MOVE_PARTICLE_COLORS,
      );
    }
  
    // Update bullet motion
    for (let bullet of this.bullets) {
      bullet.age += dt;
      if (bullet.age > MAX_BULLET_AGE) {
        bullet.destroy();
      } else {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;
  
        // Wrap around
        wrapAround(bullet, BULLET_RADIUS * 2, BULLET_RADIUS * 2);
      }
    }
  
    // Update bullet collision
    for (let bullet of this.bullets) {
      for (let asteroid of this.asteroids) {
        if (withinRadius(bullet, asteroid, asteroid.size)) {
          this.flashScore = 1;
          this.score++;
          if (this.score > this.highScore) {
            this.flashHighScore = this.score - this.highScore;
            this.highScore = this.score;
            localStorage.setItem('highscore', `${this.highScore}`);
          }
          explode(
            this,
            asteroid.x,
            asteroid.y,
            10,
            RAND_ASTEROID_EXPLODE_PARTICLE_COLORS,
          );
          // Assets.SoundPop.current.play();
          bullet.destroy();
          asteroid.breakUp(
            bullet.dx * ASTEROID_BREAK_DAMP_FACTOR,
            bullet.dy * ASTEROID_BREAK_DAMP_FACTOR
          );
          break;
        }
      }
    }
  
    // Update particle motion
    for (let particle of this.particles) {
      particle.age += dt;
      if (particle.age > MAX_PARTICLE_AGE) {
        particle.destroy();
      } else {
        particle.x += particle.dx;
        particle.y += particle.dy;
  
        // Wrap around
        wrapAround(particle, PARTICLE_RADIUS * 2, PARTICLE_RADIUS * 2);
      }
    }
  
    // Update asteroid motion
    for (let asteroid of this.asteroids) {
      asteroid.x += asteroid.dx;
      asteroid.y += asteroid.dy;
  
      // Wrap around
      wrapAround(asteroid, asteroid.size * 2, asteroid.size * 2);
    }
  
    // Update asteroid collision
    for (let asteroid of this.asteroids) {
      if (withinRadius(asteroid, this.player, asteroid.size + PLAYER_RADIUS)) {
        explode(
          this,
          asteroid.x,
          asteroid.y,
          10,
          RAND_ASTEROID_EXPLODE_PARTICLE_COLORS,
        );
        asteroid.destroy();
        killPlayer(this);
        break;
      }
    }
  
    // Update power-up motion
    for (let powerUp of this.powerUps) {
      powerUp.x += powerUp.dx;
      powerUp.y += powerUp.dy;
  
      // Wrap around
      wrapAround(powerUp, POWER_UP_RADIUS * 2, POWER_UP_RADIUS * 2);
    }
  
    // Update power-up collision
    for (let powerUp of this.powerUps) {
      if (withinRadius(powerUp, this.player, POWER_UP_RADIUS + PLAYER_RADIUS)) {
        explode(
          this,
          powerUp.x,
          powerUp.y,
          10,
          RAND_POWER_UP_EXPLODE_PARTICLE_COLORS
        );
        powerUp.destroy();
        this.player.powerMode += POWER_UP_AMOUNT;
        break;
      }
    }
  
    // Update starfield
    Starfield.updateStarfield(this.starfield);
  
    // Update spawner
    this.asteroidSpawner.update(dt);
    this.powerUpSpawner.update(dt);
  
    if (!this.gamePause && this.asteroids.length <= 0) {
      this.gamePause = true;
      this.showPlayer = true;
      // Assets.SoundStart.current.play();
      setTimeout(() => (this.gameWait = true), 1000);
    }
  }

  /**
   * @param {InputContext} axb 
   */
  firstInput(axb) {
    if (!this.isFirstInput) {
      return;
    }
    axb.bindKeys([
      PLAYER_UP, PLAYER_DOWN,
      PLAYER_LEFT, PLAYER_RIGHT,
      PLAYER_FIRE, PLAYER_DEBUG
    ]);
    this.isFirstInput = false;
  }

  /**
   * @param {InputContext} axb 
   */
  input(axb) {
    this.firstInput(axb);

    if (axb.isAnyButtonPressed()) {
      if (this.gameWait) {
        if (this.gameStart) {
          // Assets.BackgroundMusic.current.play();
          this.score = 0;
          this.flashScore = 1;
          this.level = 0;
          this.gameStart = false;
          this.player.powerMode = 0;
          this.powerUps.length = 0;
          this.asteroidSpawner.reset();
          this.powerUpSpawner.reset();
        }
        this.gameWait = false;
        nextLevel(this);
      }
    }

    this.player.up = axb.getButtonValue('up');
    this.player.down = axb.getButtonValue('down');
    this.player.left = axb.getButtonValue('left');
    this.player.right = axb.getButtonValue('right');
    this.player.fire = axb.getButtonValue('fire');

    if (axb.isButtonPressed('debug')) {
      SHOW_COLLISION = !SHOW_COLLISION;
    }
  }


  /**
   * @param {RenderingContext} ctx 
   */
  render(ctx) {
    ctx = /** @type {CanvasRenderingContext2D} */ (ctx);

    // Draw background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Draw starfield
    Starfield.renderStarfield(ctx, this.starfield);

    // Draw hint
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '16px sans-serif';
    ctx.fillText(this.hint, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 32);

    // Draw score
    if (this.flashScore > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.flashScore + 0.2})`;
      this.flashScore -= FLASH_TIME_STEP;
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    }
    ctx.font = '48px sans-serif';
    ctx.fillText(
      '= ' + String(this.score).padStart(2, '0') + ' =',
      SCREEN_WIDTH / 2,
      SCREEN_HEIGHT / 2
    );
    if (this.flashHighScore > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.flashHighScore + 0.2})`;
      this.flashHighScore -= FLASH_TIME_STEP;
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    }
    ctx.font = '16px sans-serif';
    ctx.fillText(
      String(this.highScore).padStart(2, '0'),
      SCREEN_WIDTH / 2,
      SCREEN_HEIGHT / 2 + 32
    );

    // Draw timer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(
      `${Math.ceil(this.asteroidSpawner.spawnTicks / 1000)}`,
      SCREEN_WIDTH,
      SCREEN_HEIGHT - 12
    );

    // Draw asteroid
    for (let asteroid of this.asteroids) {
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

    // Draw power-up
    for (let powerUp of this.powerUps) {
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

    // Draw bullet
    for (let bullet of this.bullets) {
      ctx.translate(bullet.x, bullet.y);
      ctx.rotate(bullet.rotation);
      ctx.fillStyle = BULLET_COLOR;
      ctx.fillRect(
        -BULLET_RADIUS,
        -BULLET_RADIUS,
        BULLET_RADIUS * 4,
        BULLET_RADIUS * 2
      );
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      drawCollisionCircle(ctx, bullet.x, bullet.y, BULLET_RADIUS);
    }

    // Draw particle
    for (let particle of this.particles) {
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.fillStyle = particle.color;
      let size = PARTICLE_RADIUS * (1 - particle.age / MAX_PARTICLE_AGE);
      ctx.fillRect(-size, -size, size * 2, size * 2);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    // Draw player
    if (this.showPlayer) {
      ctx.translate(this.player.x, this.player.y);
      ctx.rotate(this.player.rotation);
      ctx.fillStyle = 'white';
      let size = PLAYER_RADIUS;
      ctx.fillRect(-size, -size, size * 2, size * 2);
      let xOffset = -1;
      let yOffset = 0;
      let sizeOffset = 0;
      if (this.flashShootDelta > 0) {
        ctx.fillStyle = `rgb(${
          200 * this.flashShootDelta +
          55 * Math.sin(performance.now() / (PLAYER_SHOOT_COOLDOWN * 2))
        }, 0, 0)`;
        this.flashShootDelta -= FLASH_TIME_STEP;
        sizeOffset = this.flashShootDelta * 2;
        xOffset = this.flashShootDelta;
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
    }

    drawCollisionCircle(ctx, this.player.x, this.player.y, PLAYER_RADIUS);
  }
}

/**
 * @typedef {{ x: number, y: number }} Position
 */

/**
 * @param {Position} position 
 * @param {number} width 
 * @param {number} height 
 */
function wrapAround(position, width, height) {
  if (position.x < -width) position.x = SCREEN_WIDTH;
  if (position.y < -height) position.y = SCREEN_HEIGHT;
  if (position.x > SCREEN_WIDTH + width / 2) position.x = -width;
  if (position.y > SCREEN_HEIGHT + height / 2) position.y = -height;
}

/**
 * @param {Position} from 
 * @param {Position} to 
 * @param {number} radius
 */
function withinRadius(from, to, radius) {
  const dx = from.x - to.x;
  const dy = from.y - to.y;
  return dx * dx + dy * dy <= radius * radius;
}

/**
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} x 
 * @param {number} y 
 * @param {number} radius
 */
function drawCollisionCircle(ctx, x, y, radius) {
  if (!SHOW_COLLISION) return;
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'lime';
  ctx.stroke();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

/**
 * @param {MainScene} scene 
 * @param {number} x 
 * @param {number} y 
 * @param {number} dx 
 * @param {number} dy
 */
function createPowerUp(scene, x, y, dx, dy) {
  return {
    scene,
    x,
    y,
    dx,
    dy,
    rotation: Math.atan2(dy, dx),
    destroy() {
      this.scene.powerUps.splice(this.scene.powerUps.indexOf(this), 1);
    },
  };
}

/**
 * @param {MainScene} scene 
 * @param {number} x 
 * @param {number} y 
 * @param {number} dx 
 * @param {number} dy 
 * @param {number} size
 */
function createAsteroid(scene, x, y, dx, dy, size) {
  return {
    scene,
    x,
    y,
    dx,
    dy,
    size,
    rotation: Math.atan2(dy, dx),
    breakUp(dx = 0, dy = 0) {
      this.destroy();
      if (this.size > SMALL_ASTEROID_RADIUS) {
        let children = [];
        children.push(
          createAsteroid(
            this.scene,
            this.x + Random.range(-ASTEROID_RADIUS, ASTEROID_RADIUS),
            this.y + Random.range(-ASTEROID_RADIUS, ASTEROID_RADIUS),
            Random.range(-ASTEROID_SPEED, ASTEROID_SPEED) + dx,
            Random.range(-ASTEROID_SPEED, ASTEROID_SPEED) + dy,
            SMALL_ASTEROID_RADIUS
          )
        );
        children.push(
          createAsteroid(
            this.scene,
            this.x + Random.range(-ASTEROID_RADIUS, ASTEROID_RADIUS),
            this.y + Random.range(-ASTEROID_RADIUS, ASTEROID_RADIUS),
            Random.range(-ASTEROID_SPEED, ASTEROID_SPEED) + dx,
            Random.range(-ASTEROID_SPEED, ASTEROID_SPEED) + dy,
            SMALL_ASTEROID_RADIUS
          )
        );
        children.push(
          createAsteroid(
            this.scene,
            this.x + Random.range(-ASTEROID_RADIUS, ASTEROID_RADIUS),
            this.y + Random.range(-ASTEROID_RADIUS, ASTEROID_RADIUS),
            Random.range(-ASTEROID_SPEED, ASTEROID_SPEED) + dx,
            Random.range(-ASTEROID_SPEED, ASTEROID_SPEED) + dy,
            SMALL_ASTEROID_RADIUS
          )
        );
        children.push(
          createAsteroid(
            this.scene,
            this.x + Random.range(-ASTEROID_RADIUS, ASTEROID_RADIUS),
            this.y + Random.range(-ASTEROID_RADIUS, ASTEROID_RADIUS),
            Random.range(-ASTEROID_SPEED, ASTEROID_SPEED) + dx,
            Random.range(-ASTEROID_SPEED, ASTEROID_SPEED) + dy,
            SMALL_ASTEROID_RADIUS
          )
        );
        this.scene.asteroids.push(...children);
      }
    },
    destroy() {
      this.scene.asteroids.splice(this.scene.asteroids.indexOf(this), 1);
    },
  };
}

/**
 * @param {MainScene} scene 
 * @param {number} x 
 * @param {number} y 
 * @param {number} dx 
 * @param {number} dy
 */
function createBullet(scene, x, y, dx, dy) {
  return {
    scene,
    x,
    y,
    dx,
    dy,
    rotation: Math.atan2(dy, dx),
    age: 0,
    destroy() {
      this.scene.bullets.splice(this.scene.bullets.indexOf(this), 1);
    },
  };
}

/**
 * @param {MainScene} scene 
 * @param {number} x 
 * @param {number} y 
 * @param {number} dx 
 * @param {number} dy 
 * @param {(() => string)|string} color
 */
function createParticle(scene, x, y, dx, dy, color) {
  if (typeof color === 'function') color = color.call(undefined);
  return {
    scene,
    x,
    y,
    dx,
    dy,
    rotation: Math.atan2(dy, dx),
    age: 0,
    color,
    destroy() {
      this.scene.particles.splice(this.scene.particles.indexOf(this), 1);
    },
  };
}

/**
 * @param {MainScene} scene 
 */
function nextLevel(scene) {
  scene.bullets.length = 0;
  scene.asteroids.length = 0;
  scene.particles.length = 0;
  scene.player.x = SCREEN_WIDTH / 2;
  scene.player.y = SCREEN_HEIGHT / 2;
  scene.player.dx = 0;
  scene.player.dy = 0;
  scene.level++;
  scene.gamePause = false;
  scene.showPlayer = true;

  for (let i = 0; i < ASTEROID_SPAWN_INIT_COUNT * scene.level; ++i) {
    scene.asteroidSpawner.spawn();
  }

  if (Random.next() > POWER_UP_SPAWN_CHANCE) {
    scene.powerUpSpawner.spawn();
  }

  /*
  if (!Assets.BackgroundMusic.current.isPlaying()) {
    Assets.BackgroundMusic.current.play({ loop: true });
  }
  */
}

/**
 * @param {MainScene} scene 
 */
function killPlayer(scene) {
  scene.gamePause = true;
  scene.showPlayer = false;
  explode(
    scene,
    scene.player.x,
    scene.player.y,
    100,
    RAND_PLAYER_EXPLODE_PARTICLE_COLORS,
  );
  // Assets.SoundDead.current.play();
  // Assets.SoundBoom.current.play();
  setTimeout(() => (scene.gameStart = scene.gameWait = true), 1000);
}

/**
 * @param {MainScene} scene 
 * @param {number} x 
 * @param {number} y 
 * @param {number} dx 
 * @param {number} dy 
 * @param {(() => string)|string} color
 */
function thrust(scene, x, y, dx, dy, color) {
  if (Random.next() > 0.3) {
    let particle = createParticle(
      scene,
      x + Random.range(PLAYER_MOVE_PARTICLE_OFFSET_RANGE[0], PLAYER_MOVE_PARTICLE_OFFSET_RANGE[1]),
      y + Random.range(PLAYER_MOVE_PARTICLE_OFFSET_RANGE[0], PLAYER_MOVE_PARTICLE_OFFSET_RANGE[1]),
      dx,
      dy,
      color
    );
    particle.age = Random.range(
      MAX_PARTICLE_AGE * MIN_PLAYER_MOVE_PARTICLE_LIFE_RATIO,
      MAX_PARTICLE_AGE * MAX_PLAYER_MOVE_PARTICLE_LIFE_RATIO
    );
    scene.particles.push(particle);
  }
}

/**
 * @param {MainScene} scene 
 * @param {number} x 
 * @param {number} y 
 * @param {number} amount 
 * @param {(() => string)|string} color
 */
function explode(scene, x, y, amount = 10, color) {
  for (let i = 0; i < amount; ++i) {
    scene.particles.push(
      createParticle(
        scene,
        x,
        y,
        Random.range(-1, 1) * PARTICLE_SPEED,
        Random.range(-1, 1) * PARTICLE_SPEED,
        color
      )
    );
  }
}
