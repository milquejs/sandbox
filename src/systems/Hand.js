import { CLICK, CURSOR_X, CURSOR_Y, WORLD_RENDER, WORLD_UPDATE } from '../index';
import HAND, {
  FRAME_WIDTH,
  FRAME_HEIGHT,
  FRAME_COUNT,
} from '../assets/hand.png.asset';
import { lerp } from '@milquejs/milque';
import { drawSpriteUV } from './SpriteUV';

const HAND_OFFSET_X = -20;
const HAND_OFFSET_Y = -20;

/**
 * @param {import('../index.js').World} world
 */
export function Hand(world) {
  WORLD_UPDATE.on(world.topics, 0, onUpdate);
  WORLD_RENDER.on(world.topics, 1, onRender);

  let handX = 0;
  let handY = 0;
  return {
    handX,
    handY,
    armX: 0,
    armY: 0,
  };
}

/** @type {import('@milquejs/milque').TopicCallback<import('../index.js').World>} */
function onUpdate(world) {
  let dt = (world.frame?.deltaTime || 0) / 60
  let hand = world.systems.get(Hand);

  let cx = CURSOR_X.current.value * world.display.width;
  let cy = CURSOR_Y.current.value * world.display.height;

  hand.handX = lerp(hand.handX, cx, 0.6 * dt);
  hand.handY = lerp(hand.handY, cy, 0.6 * dt);
  hand.armX = lerp(hand.armX, hand.handX, 2 * dt);
  hand.armY = lerp(hand.armY, hand.handY, 2 * dt);
}

/** @type {import('@milquejs/milque').TopicCallback<import('../index.js').World>} */
function onRender(world) {
  const { ctx, tia } = world;
  let hand = world.systems.get(Hand);

  let down = CLICK.current.value > 0;

  let index = down ? 1 : 0;
  let dy = down ? -10 : 0;
  drawHand(ctx, tia, hand.handX, hand.handY + dy, index);
  drawHand(ctx, tia, hand.armX, hand.armY + dy, 2);
}

/**
 * @param {CanvasRenderingContext2D} ctx 
 * @param {import('@milquejs/milque').Experimental.Tia} tia 
 * @param {number} x 
 * @param {number} y 
 * @param {number} spriteIndex 
 */
export function drawHand(ctx, tia, x, y, spriteIndex) {
  drawSpriteUV(ctx, tia, HAND.current, x + HAND_OFFSET_X, y + HAND_OFFSET_Y, spriteIndex, FRAME_WIDTH, FRAME_HEIGHT, FRAME_COUNT);
}
