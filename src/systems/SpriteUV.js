/**
 * @param {CanvasRenderingContext2D} ctx 
 * @param {import('@milquejs/milque').Experimental.Tia} tia 
 * @param {HTMLImageElement} image 
 * @param {number} x 
 * @param {number} y 
 * @param {number} spriteIndex 
 * @param {number} w 
 * @param {number} h 
 * @param {number} l 
 */
export function drawSpriteUV(ctx, tia, image, x, y, spriteIndex, w, h, l) {
  let i = Math.floor(spriteIndex) % l;
  let u = i * w;
  let v = 0;
  tia.sprUV(ctx, image, u, v, u + w, v + h, x, y, w, h);
}
