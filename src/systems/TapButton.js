import TAP_BUTTON, {
  FRAME_COUNT,
  FRAME_HEIGHT,
  FRAME_WIDTH,
} from '../assets/tap_button.png.asset';
import {
  CLICK,
  CURSOR_X,
  CURSOR_Y,
  WORLD_LOAD,
  WORLD_RENDER,
  WORLD_UPDATE,
} from '../index';
import { drawSpriteUV } from '../util/SpriteUV';

/**
 * @param {import('../index.js').World} world
 */
export function TapButton(world) {
  WORLD_LOAD.on(world.topics, 0, onLoad);
  WORLD_UPDATE.on(world.topics, 0, onUpdate);
  WORLD_RENDER.on(world.topics, 0, onRender);

  let buttonX = 0;
  let buttonY = 0;
  return {
    buttonX,
    buttonY,
    mask: createMask(0, 0),
    hover: false,
    active: false,
  };
}

/**
 * @param {import('../index').World} m 
 */
async function onLoad(m) {
  await TAP_BUTTON.load(m.assets);
}

/** @type {import('@milquejs/milque').TopicCallback<import('../index.js').World>} */
function onUpdate(world) {
  let button = world.systems.get(TapButton);
  button.buttonX = world.display.width / 2;
  button.buttonY = 32;

  let cx = CURSOR_X.current.value * world.display.width;
  let cy = CURSOR_Y.current.value * world.display.height;

  button.mask = createMask(button.buttonX, button.buttonY);
  let [x1, y1, x2, y2] = button.mask;
  button.hover = Boolean(cx >= x1 && cx <= x2 && cy >= y1 && cy <= y2);
  button.active = Boolean(CLICK.current.value > 0);
}

/** @type {import('@milquejs/milque').TopicCallback<import('../index.js').World>} */
function onRender(world) {
  const { ctx, tia } = world;
  let button = world.systems.get(TapButton);

  let index = 0;
  index = button.hover ? (button.active ? 3 : 1) : 0;

  drawButton(
    ctx,
    tia,
    button.buttonX - FRAME_WIDTH / 2,
    button.buttonY - FRAME_HEIGHT / 2,
    index,
  );

  let cx = CURSOR_X.current.value * world.display.width;
  let cy = CURSOR_Y.current.value * world.display.height;
  tia.circFill(ctx, cx, cy, 10, 0xff00ff);

  let [x1, y1, x2, y2] = button.mask;
  // tia.rect(ctx, x1, y1, x2, y2, 0x00FF00);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('@milquejs/milque').Experimental.Tia} tia
 * @param {number} x
 * @param {number} y
 * @param {number} spriteIndex
 */
export function drawButton(ctx, tia, x, y, spriteIndex) {
  let t = TAP_BUTTON.current;
  if (!t) {
    throw new Error('Missing tap button asset.');
  }
  drawSpriteUV(
    ctx,
    tia,
    t,
    x,
    y,
    spriteIndex,
    FRAME_WIDTH,
    FRAME_HEIGHT,
    FRAME_COUNT,
  );
}

/**
 * @param {number} x
 * @param {number} y
 */
function createMask(x, y) {
  let x1 = x - FRAME_WIDTH / 2 + 20;
  let y1 = y - FRAME_HEIGHT / 2 + 40;
  let x2 = x + FRAME_WIDTH / 2 - 20;
  let y2 = y + FRAME_HEIGHT / 2 - 50;
  return [x1, y1, x2, y2];
}
