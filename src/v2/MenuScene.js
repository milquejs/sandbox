import { InputContext } from '@milquejs/milque';
import { PLAYER_DOWN, PLAYER_FIRE, PLAYER_UP } from './Players';
import { Game } from '@/game/Game';
import { MainScene } from './MainScene';

export const FONT_SIZE = 32;
export const FADE_MILLIS = 1_000;

export class MenuScene {

  /** @type {Array<Button>} */
  buttons = [];

  selectIndex = 0;

  fadeOut = {
    start: false,
    progress: 0,
  };

  /**
   * @param {Game} game 
   */
  constructor(game) {
    this.game = game;
  }

  init() {
    let margin = 10;
    let offset = 200;
    spawnButton(this, 'Play', margin, offset + 50, 200);
    spawnButton(this, 'Options', margin, offset + 100, 200);
    spawnButton(this, 'About', margin, offset + 150, 200);
    spawnButton(this, 'Quit', margin, offset + 200, 200);
  }

  /**
   * @param {InputContext} axb 
   */
  input(axb) {
    if (this.fadeOut.start) {
      return;
    }
    if (PLAYER_UP.get(axb).pressed) {
      this.selectIndex--;
      if (this.selectIndex < 0) {
        this.selectIndex = this.buttons.length - 1;
      }
    }
    if (PLAYER_DOWN.get(axb).pressed) {
      this.selectIndex++;
      if (this.selectIndex >= this.buttons.length) {
        this.selectIndex = 0;
      }
    }
    if (PLAYER_FIRE.get(axb).pressed) {
      // Start transition!
      this.fadeOut.start = true;
    }
  }

  /**
   * @param {number} dt 
   */
  update(dt) {
    if (this.fadeOut.start) {
      if (this.fadeOut.progress < FADE_MILLIS) {
        this.fadeOut.progress += dt;
      } else {
        // Finished! Move to the next scene!
        this.game.stop().then(() => {
          let scene = new MainScene();
          this.game.init([scene], [scene]);
        });
      }
      return;
    }
    updateMenuScene(this, dt);
  }

  /**
   * @param {RenderingContext} ctx
   */
  render(ctx) {
    ctx = /** @type {CanvasRenderingContext2D} */ (ctx);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.save();
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.font = '64px monospace';
    ctx.fillStyle = 'white';
    ctx.fillText('Asteroids', ctx.canvas.width / 2, 100);
    ctx.restore();

    drawMenuScene(this, ctx);

    if (this.fadeOut.start) {
      ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeOut.progress / FADE_MILLIS})`;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }
}

/**
 * @param {MenuScene} scene 
 * @param {number} dt 
 */
export function updateMenuScene(scene, dt) {}

/**
 * @param {MenuScene} scene 
 * @param {CanvasRenderingContext2D} ctx 
 */
export function drawMenuScene(scene, ctx) {
  ctx.save();
  for(let i = 0; i < scene.buttons.length; ++i) {
    let button = scene.buttons[i];
    let w = button.right - button.left;
    let h = button.bottom - button.top;
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'white';
    ctx.strokeRect(button.left, button.top, w, h);

    if (scene.selectIndex === i) {
      ctx.fillStyle = 'white';
      ctx.fillRect(button.left, button.top, w, h);
      ctx.fillStyle = 'black';
    } else {
      ctx.fillStyle = 'white';
    }
    
    ctx.font = `${FONT_SIZE}px monospace`;
    ctx.textBaseline = 'top';
    ctx.fillText(button.label, button.left + w * 0.1, button.top + h * 0.1);
  }
  ctx.restore();
}

export class Button {
  left = 0;
  right = 0;
  top = 0;
  bottom = 0;
  label = '';
  hover = true;
}

/**
 * @param {MenuScene} scene 
 * @param {string} text 
 * @param {number} x 
 * @param {number} y 
 * @param {number} w
 */
export function spawnButton(scene, text, x, y, w) {
  let result = new Button();
  result.label = text;
  result.left = x;
  result.right = x + w;
  result.top = y;
  result.bottom = y + FONT_SIZE * 1.4;
  scene.buttons.push(result);
}
