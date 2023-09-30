import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@/v1/Values';

import { FLASH_TIME_STEP } from './Values';

export function init() {
  return new ScoreSystem();
}

export class ScoreSystem {
  flashScore = 0;
  flashScoreDelta = 0;

  flashHighScore = 0;
  flashHighScoreDelta = 0;

  score = 0;
  highScore = Number(localStorage.getItem('highscore'));
}

/**
 * @param {ScoreSystem} system
 * @param {CanvasRenderingContext2D} ctx
 */
export function drawScore(system, ctx) {
  if (system.flashScore > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${system.flashScore + 0.2})`;
    system.flashScore -= FLASH_TIME_STEP;
  } else {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  }
  ctx.font = '48px sans-serif';
  ctx.fillText(
    '= ' + String(system.score).padStart(2, '0') + ' =',
    SCREEN_WIDTH / 2,
    SCREEN_HEIGHT / 2,
  );
  if (system.flashHighScore > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${system.flashHighScore + 0.2})`;
    system.flashHighScore -= FLASH_TIME_STEP;
  } else {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  }
  ctx.font = '16px sans-serif';
  ctx.fillText(
    String(system.highScore).padStart(2, '0'),
    SCREEN_WIDTH / 2,
    SCREEN_HEIGHT / 2 + 32,
  );
}

/**
 * @param {ScoreSystem} system
 */
export function onGameRestart(system) {
  system.score = 0;
  system.flashScore = 1;
}

/**
 * @param {ScoreSystem} system
 */
export function increaseScore(system) {
  system.flashScore = 1;
  system.score++;
  if (system.score > system.highScore) {
    system.flashHighScore = system.score - system.highScore;
    system.highScore = system.score;
    localStorage.setItem('highscore', `${system.highScore}`);
  }
}
