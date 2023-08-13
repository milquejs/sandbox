import { AnimationFrameLoop, FlexCanvas, Experimental, AssetManager, AssetRef, ImageLoader, InputPort, AxisBinding, KeyCodes, ButtonBinding } from '@milquejs/milque';
import './error';
import './reload';

window.addEventListener('DOMContentLoaded', main);

/**
 * What does this button do?
 * Restriction: 60 secs to win.
 */

import NUMS from './nums.png.asset.js';

const CURSOR_X = new AxisBinding('cursorX', KeyCodes.MOUSE_POS_X);
const CURSOR_Y = new AxisBinding('cursorY', KeyCodes.MOUSE_POS_Y);
const CLICK = new ButtonBinding('click', [KeyCodes.MOUSE_BUTTON_0, KeyCodes.MOUSE_BUTTON_2]);

async function main() {
  const assets = new AssetManager();
  await NUMS.load(assets);

  const display = FlexCanvas.create({
    id: 'display',
    sizing: 'viewport',
    scaling: 'scale',
    width: 600,
    height: 400,
  });
  const inputs = InputPort.create({ for: 'display' });

  const world = createWorld(display, inputs, assets);

  const frameLoop = new AnimationFrameLoop(e => {
    world.axb.poll(e.detail.currentTime);
    update(world);
    draw(world);
  });
  frameLoop.start();
}

/** @typedef {ReturnType<createWorld>} World */

/**
 * @param {FlexCanvas} display
 * @param {InputPort} inputs
 * @param {AssetManager} assets
 */
function createWorld(display, inputs, assets) {
  const ctx = /** @type {CanvasRenderingContext2D} */ (display.getContext('2d'));
  const axb = inputs.getContext('axisbutton');
  const tia = new Experimental.Tia();

  CURSOR_X.bindKeys(axb);
  CURSOR_Y.bindKeys(axb);
  CLICK.bindKeys(axb);

  const BOX_SIZE = 100;
  let box = { x: 0, y: 0, dx: 1, dy: 1 };
  let timer = { count: 0 };

  return {
    display,
    inputs,
    assets,
    tia,
    ctx,
    axb,
    BOX_SIZE,
    box,
    timer,
  };
}

/**
 * @param {World} world 
 */
function update(world) {
  const { box, display, timer } = world;
  
  box.x += box.dx;
  box.y += box.dy;

  if (box.x < 0 || box.x > display.width) {
    box.x = Math.min(Math.max(0, box.x), display.width);
    box.dx *= -1;
  }

  if (box.y < 0 || box.y > display.height) {
    box.y = Math.min(Math.max(0, box.y), display.height);
    box.dy *= -1;
  }

  timer.count += 0.01;
}

/**
 * @param {World} world 
 */
function draw(world) {
  const { ctx, display, tia, box, BOX_SIZE, timer } = world;
  tia.camera(0, 0, display.width, display.height);
  tia.cls(ctx, 0x333333);
  drawText(ctx, tia, display.width / 2, display.height / 2, String(60 - Math.floor(timer.count % 60)).padStart(2, '0'));
  tia.rectFill(ctx, box.x - BOX_SIZE / 2, box.y - BOX_SIZE / 2, box.x + BOX_SIZE / 2, box.y + BOX_SIZE / 2, 0xFF0000);
}

/**
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Experimental.Tia} tia 
 * @param {number} x
 * @param {number} y
 * @param {string} text
 */
function drawText(ctx, tia, x, y, text) {
  const w = 64;
  const h = 64;
  let dx = 0;
  let dy = 0;
  text = String(text);
  for(let pos = 0; pos < text.length; ++pos) {
    let ch = text.charAt(pos);
    let uv = [0, 0];
    switch (ch) {
      case '1':
        uv = [1, 0];
        break;
      case '2':
        uv = [2, 0];
        break;
      case '3':
        uv = [3, 0];
        break;
      case '4':
        uv = [0, 1];
        break;
      case '5':
        uv = [1, 1];
        break;
      case '6':
        uv = [2, 1];
        break;
      case '7':
        uv = [3, 1];
        break;
      case '8':
        uv = [0, 2];
        break;
      case '9':
        uv = [1, 2];
        break;
      case 'S':
        uv = [2, 2];
        break;
      case 'A':
        uv = [3, 2];
        break;
      case 'B':
        uv = [0, 3];
        break;
      case 'C':
        uv = [1, 3];
        break;
      case 'D':
        uv = [2, 3];
        break;
      case 'F':
        uv = [3, 3];
        break;
      case '\n':
        dy += h;
        dx = 0;
        continue;
      case '0':
      default:
        uv = [0, 0];
        break;
    }
    let du = uv[0] * w;
    let dv = uv[1] * h;
    tia.sprUV(ctx, NUMS.current, du, dv, du + w, dv + h, x + dx, y + dy, w, h);
    dx += Math.floor(w * 0.66);
  }
}
