import { CLICK, CURSOR_X, CURSOR_Y, WORLD_RENDER, WORLD_UPDATE } from '../index';
import BUTTON, {
  FRAME_WIDTH as BUTTON_WIDTH,
  FRAME_HEIGHT as BUTTON_HEIGHT,
  FRAME_COUNT as BUTTON_FRAME_COUNT
} from '../assets/button.png.asset';
import { getCurrentState, moveToState } from './Intro';
import { Timer } from './Timer';
import { Wizard } from './Wizard';

/**
 * @param {import('../index.js').World} world
 */
export function Button(world) {
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

/** @type {import('@milquejs/milque').TopicCallback<import('../index.js').World>} */
function onUpdate(world) {
  let button = world.systems.get(Button);
  button.buttonX = world.display.width / 2;
  button.buttonY = world.display.height - BUTTON_HEIGHT / 3;

  let cx = CURSOR_X.current.value * world.display.width;
  let cy = CURSOR_Y.current.value * world.display.height;
  
  button.mask = createMask(button.buttonX, button.buttonY);
  let [x1, y1, x2, y2] = button.mask;
  button.hover = Boolean(cx >= x1 && cx <= x2 && cy >= y1 && cy <= y2);
  let prevActive = button.active;
  button.active = Boolean(CLICK.current.value > 0);

  // Still hovering, but has finished clicking!
  if (button.hover && !button.active && prevActive) {
    const wizards = world.systems.get(Wizard);
    wizards.spawnTimer = 0;
  }
}

/** @type {import('@milquejs/milque').TopicCallback<import('../index.js').World>} */
function onRender(world) {
  const { ctx, tia } = world;
  let button = world.systems.get(Button);

  let index = 0;
  index = button.hover ? button.active ? 3 : 1 : 0;

  drawButton(ctx, tia, button.buttonX - BUTTON_WIDTH / 2, button.buttonY - BUTTON_HEIGHT / 2, index);

  let cx = CURSOR_X.current.value * world.display.width;
  let cy = CURSOR_Y.current.value * world.display.height;
  tia.circFill(ctx, cx, cy, 10, 0xFF00FF);

  let [x1, y1, x2, y2] = button.mask;
  //tia.rect(ctx, x1, y1, x2, y2, 0x00FF00);
}

/**
 * @param {import('../index.js').World} world 
 * @param {number} maskId 
 */
function onClick(world, maskId) {
  
}

/**
 * @param {CanvasRenderingContext2D} ctx 
 * @param {import('@milquejs/milque').Experimental.Tia} tia 
 * @param {number} x 
 * @param {number} y 
 * @param {number} spriteIndex 
 */
export function drawButton(ctx, tia, x, y, spriteIndex) {
  let w = BUTTON_WIDTH;
  let h = BUTTON_HEIGHT;
  let l = BUTTON_FRAME_COUNT;
  let i = spriteIndex % l;
  let u = i * w;
  let v = 0;
  tia.sprUV(ctx, BUTTON.current, u, v, u + w, v + h, x, y, w, h);
}

/**
 * @param {number} x
 * @param {number} y
 */
function createMask(x, y) {
  let x1 = x - BUTTON_WIDTH / 2 + 50;
  let y1 = y - BUTTON_HEIGHT / 2 + 20;
  let x2 = x + BUTTON_WIDTH / 2 - 50;
  let y2 = y + BUTTON_HEIGHT / 2 - 50;
  return [x1, y1, x2, y2];
}
