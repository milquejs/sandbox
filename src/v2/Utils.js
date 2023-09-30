import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../v1/Values';
import { SHOW_COLLISION } from './Values';

/**
 * @typedef {{ x: number, y: number }} Position
 */

/**
 * @param {Position} position
 * @param {number} width
 * @param {number} height
 */
export function wrapAround(position, width, height) {
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
export function withinRadius(from, to, radius) {
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
export function drawCollisionCircle(ctx, x, y, radius) {
  if (!SHOW_COLLISION) return;
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'lime';
  ctx.stroke();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
