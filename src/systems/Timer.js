import NUMS from '../assets/nums.png.asset';
import { WORLD_RENDER, WORLD_UPDATE } from '../index';
import { Room } from './Room';

/**
 *
 * @param {import('../index.js').World} world
 */
export function Timer(world) {
  WORLD_UPDATE.on(world.topics, 0, onUpdate);
  WORLD_RENDER.on(world.topics, 0, onRender);

  let count = 0;
  return {
    count,
  };
}

/** @type {import('@milquejs/milque').TopicCallback<import('../index.js').World>} */
function onUpdate(world) {
  let timer = world.systems.get(Timer);
  timer.count += 0.01;
  if (timer.count > 60) {
    const room = world.systems.get(Room);
    room.state = 'lose';
  }
}

/** @type {import('@milquejs/milque').TopicCallback<import('../index.js').World>} */
function onRender(world) {
  const { ctx, display, tia } = world;
  let timer = world.systems.get(Timer);

  const halfSize = 64 / 2;
  tia.push();
  tia.matPos(
    display.width / 2 - halfSize * 6,
    display.height / 2 - halfSize * 4,
  );
  tia.matScale(4, 4);
  drawText(
    ctx,
    tia,
    0,
    0,
    String(Math.max(60 - Math.floor(timer.count), 0)).padStart(2, '0'),
  );
  tia.pop();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('@milquejs/milque').Experimental.Tia} tia
 * @param {number} x
 * @param {number} y
 * @param {string} text
 */
export function drawText(ctx, tia, x, y, text) {
  const w = 64;
  const h = 64;
  let dx = 0;
  let dy = 0;
  text = String(text);
  for (let pos = 0; pos < text.length; ++pos) {
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
        let i = Math.abs(stringHash(ch + 'fancy') % 4);
        let j = Math.abs(stringHash(ch + 'regal') % 4);
        uv = [i, j];
        break;
    }
    let du = uv[0] * w;
    let dv = uv[1] * h;
    tia.sprUV(ctx, NUMS.current, du, dv, du + w, dv + h, x + dx, y + dy, w, h);
    dx += Math.floor(w * 0.66);
  }
}

/**
 * Generates a number hash for the string. For an empty string, it will return 0.
 *
 * @param {string} [value=''] The string to hash.
 * @returns {number} A hash that uniquely identifies the string.
 */
export function stringHash(value = '') {
  let hash = 0;
  for (let i = 0, len = value.length; i < len; i++) {
    hash = (Math.imul(31, hash) + value.charCodeAt(i)) | 0;
  }
  return hash;
}
