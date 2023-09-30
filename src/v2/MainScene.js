import { ButtonBinding, InputContext, KeyCodes } from '@milquejs/milque';

import * as Starfield from '../v1/Starfield';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../v1/Values';
import * as Asteroids from './Asteroids';
import * as Bullets from './Bullets';
import * as Particles from './Particles';
import * as Players from './Players';
import * as PowerUps from './PowerUps';

const INSTRUCTION_HINT_TEXT = '[ wasd_ ]';
const FLASH_TIME_STEP = 0.1;

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

  gamePause = true;
  showPlayer = true;
  gameStart = true;
  gameWait = true;
  hint = INSTRUCTION_HINT_TEXT;

  constructor() {
    this.players = Players.init();
    this.asteroids = Asteroids.init();
    this.bullets = Bullets.init();
    this.particles = Particles.init();
    this.powerUps = PowerUps.init();
    this.starfield = Starfield.createStarfield(SCREEN_WIDTH, SCREEN_HEIGHT);

    this.player = Players.spawnPlayer(this.players);
  }

  /**
   * @param {number} dt
   */
  update(dt) {
    // NOTE: Ignore game pauses for particle updates
    Particles.updateParticles(this.particles, dt);

    if (this.gamePause) {
      return;
    }

    Players.updatePlayers(
      this.players,
      dt,
      this.player,
      this.particles,
      this.bullets,
    );
    Bullets.updateBullets(this.bullets, dt, this);
    Asteroids.updateAsteroids(
      this.asteroids,
      dt,
      this.player,
      this,
      this.particles,
    );
    Starfield.updateStarfield(this.starfield);
    PowerUps.updatePowerUps(this.powerUps, dt, this.player, this.particles);

    if (!this.gamePause && Asteroids.countAsteroids(this.asteroids) <= 0) {
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
    Players.registerInputs(axb);
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
          Players.onGameRestart(this.players);
          Asteroids.onGameRestart(this.asteroids);
          PowerUps.onGameRestart(this.powerUps);
        }
        this.gameWait = false;
        nextLevel(this);
      }
    }

    Players.inputPlayer(this.players, this.player, axb);

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
      SCREEN_HEIGHT / 2,
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
      SCREEN_HEIGHT / 2 + 32,
    );

    // Draw timer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(
      `${Math.ceil(this.asteroids.spawner.spawnTicks / 1000)}`,
      SCREEN_WIDTH,
      SCREEN_HEIGHT - 12,
    );

    Asteroids.drawAsteroids(this.asteroids, ctx);
    PowerUps.drawPowerUps(this.powerUps, ctx);
    Bullets.drawBullets(this.bullets, ctx);
    Particles.drawParticles(this.particles, ctx);

    // Draw player
    if (this.showPlayer) {
      Players.drawPlayers(this.players, ctx);
    }
  }
}

/**
 * @param {MainScene} scene
 */
function nextLevel(scene) {
  scene.level++;
  scene.gamePause = false;
  scene.showPlayer = true;

  Players.onNextLevel(scene.players);
  Asteroids.onNextLevel(scene.asteroids, scene);
  Bullets.onNextLevel(scene.bullets);
  PowerUps.onNextLevel(scene.powerUps);
  Particles.onNextLevel(scene.particles);

  /*
  if (!Assets.BackgroundMusic.current.isPlaying()) {
    Assets.BackgroundMusic.current.play({ loop: true });
  }
  */
}
