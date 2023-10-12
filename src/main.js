import { AnimationFrameLoop, AssetManager, Downloader, Experimental, FlexCanvas, InputContext, KeyCodes, Random } from '@milquejs/milque';

import splash_partsAsset from './assets/splash_parts.asset';
import tiled_splashAsset from './assets/tiled_splash.asset';
import logoAsset from './assets/logo.asset';

FlexCanvas.define();

export async function main() {
  const width = 2304; // 2592
  const height = 3456; // 3840
  const canvas = new FlexCanvas({
    root: document.body,
    width,
    height,
    aspectRatio: width / height,
  });
  const ctx = canvas.getContext('2d');
  const tia = new Experimental.Tia();
  const axb = new InputContext(canvas);
  const assets = new AssetManager();
  axb.bindButton('export', KeyCodes.KEYBOARD, KeyCodes.SPACE.code);
  await splash_partsAsset.load(assets);
  await tiled_splashAsset.load(assets);
  await logoAsset.load(assets);

  /** @type {Array<{ x: number, y: number, r: number, index: number }>} */
  let parts = [];

  /** @type {Array<{ x: number, y: number, r: number, index: number }>} */
  let wees = [];

  for(let x = 0; x < canvas.width; x += 250) {
    for(let y = (x / 2 % 250); y < canvas.height; y += 250) {
      parts.push({
        x: x + Random.range(0, 10) * Random.sign(),
        y: y + Random.range(0, 10) * Random.sign(),
        r: Random.range(0, 360),
        index: Random.rangeInt(0, 7),
      });
    }
  }

  const freeX = 30;
  const freeY = 80;
  for(let x = 0; x < canvas.width; x += 110) {
    for(let y = (x / 2 % 170); y < canvas.height; y += 170) {
      wees.push({
        x: x + Random.range(-freeX, freeX),
        y: y + Random.range(-freeY, freeY),
        r: Random.range(0, 360),
        index: 7 + Random.rangeInt(0, 4),
      });
    }
  }

  const center = { x: canvas.width / 2, y: canvas.height / 2 };
  const left = { x: 0, y: canvas.height / 2 };
  const right = { x: canvas.width, y: canvas.height / 2 };
  const bottom = { x: canvas.width / 2, y: canvas.height };
  const top = { x: canvas.width / 2, y: 0 };
  
  const loop = new AnimationFrameLoop();
  let once = false;
  loop.start(loop => {
    axb.poll(loop.detail.currentTime);

    if (axb.isButtonReleased('export')) {
      downloadImageFromCanvas('output.png', ctx.canvas);
    }

    if (once) {
      return;
    }

    once = true;

    tia.cls(ctx, 0x667733);
    const img = splash_partsAsset.current;
    const imgW = splash_partsAsset.opts.spriteWidth;
    const imgH = splash_partsAsset.opts.spriteHeight;
    if (!img) {
      return;
    }

    const bg = tiled_splashAsset.current;
    const bgW = tiled_splashAsset.opts.spriteWidth;
    const bgH = tiled_splashAsset.opts.spriteHeight;
    if (!bg) {
      return;
    }
    const scale = 1.4
    ctx.globalAlpha = 0.05;
    for(let i = 0; i < canvas.width; i += bgW * scale) {
      for(let j = 0; j < canvas.height; j += bgH * scale) {
        tia.sprUV(ctx, bg, 0, 0, bgW, bgH, i, j, bgW * scale, bgH * scale);
      }
    }
    ctx.globalAlpha = 1;
    
    /*
    for(let wee of wees) {
      tia.push();
      tia.matPos(wee.x, wee.y);
      tia.matRot(wee.r);
      ctx.globalAlpha = 0.1;
      tia.spr(ctx, img, wee.index, -128, -128, imgW, imgH);
      ctx.globalAlpha = 1;
      tia.pop();
    }
    for(let part of parts) {
      tia.push();
      tia.matPos(part.x, part.y);
      tia.matRot(part.r);
      ctx.globalAlpha = 0.2;
      tia.spr(ctx, img, part.index, -128, -128, imgW, imgH);
      ctx.globalAlpha = 1;
      tia.pop();
    }
    */

    const START_DATE = 'Oct 20';
    const END_DATE = 'Oct 22';
    const SHOWCASE_DATE = 'Nov 3';

    let x = 0;
    let y = 0;
    let fill = '#FFFFFF';

    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';

    ctx.font = '180px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillRect(380, 290, 1050, 90);

    fill = '#FFFFFF';
    drawShadowText(ctx, '#filmmakers', center.x - 250, top.y + 200, 10, 3, 3, fill);
    ctx.fillText('group', center.x + 520, top.y + 200);

    ctx.font = '150px Arial';
    ctx.fillText('invites you to...', center.x, top.y + 400);

    const FANCY_COLOR_A = '#8833DD';
    const FANCY_COLOR_B = '#FFAA00';
    
    const fancyBgColor = ctx.createLinearGradient(0, 750, 20, 1000);
    fancyBgColor.addColorStop(0, FANCY_COLOR_A);
    fancyBgColor.addColorStop(1, FANCY_COLOR_B);

    ctx.font = '300px Georgia';
    drawFancyText(ctx, '2023 Fall', center.x, 650, 10, 6, 6, fancyBgColor);

    const fancyBgColor2 = ctx.createLinearGradient(0, 1000, 20, 1350);
    fancyBgColor2.addColorStop(0, FANCY_COLOR_A);
    fancyBgColor2.addColorStop(1, FANCY_COLOR_B);
    ctx.font = '400px Georgia';
    drawFancyText(ctx, 'Film Jam!', center.x, 1000, 10, 6, 6, fancyBgColor2);

    // ========== CENTER ==========

    const logo = logoAsset.current;
    const logoW = logoAsset.opts.spriteWidth;
    const logoH = logoAsset.opts.spriteHeight;
    if (!logo) {
      return;
    }
    tia.spr(ctx, logo, 0, center.x + 100, center.y - 300, logoW, logoH);
    tia.spr(ctx, logo, 1, center.x + 600, center.y - 300, logoW, logoH);

    const leftMargin = 200;
    ctx.font = '150px Arial';
    ctx.textAlign = 'left';

    x = left.x + leftMargin;
    y = left.y - 200;
    ctx.fillStyle = '#000000';
    ctx.fillRect(x - 50, y + 60, 1000, 100);
    fill = '#FFFFFF';
    drawShadowText(ctx, 'Start: ' + START_DATE, x, y, 5, 5, 5, fill);

    x = left.x + leftMargin;
    y = left.y;
    ctx.fillStyle = '#000000';
    ctx.fillRect(x - 50, y + 60, 1000, 100);
    fill = '#FFFFFF';
    drawShadowText(ctx, 'End:  ' + END_DATE, x, y, 5, 5, 5, fill);

    x = left.x + leftMargin;
    y = left.y + 200;
    ctx.fillStyle = '#000000';
    ctx.fillRect(x - 50, y + 60, 1400, 100);
    fill = '#FFFFFF';
    drawShadowText(ctx, 'Showcase: ' + SHOWCASE_DATE, x, y, 5, 5, 5, fill);

    ctx.textAlign = 'center';
    x = center.x;
    y = center.y + 550;
    fill = '#FFFFFF';
    ctx.font = '180px Arial';
    drawShadowText(ctx, 'Visit our wiki for more info:', x, y, 5, 5, 5, fill);
    ctx.font = '100px Arial';
    ctx.fillText('https://w.amazon.com/bin/view/Filmmakers', x, y + 250);

    // ========== BOTTOM ==========

    ctx.textAlign = 'left';
    ctx.font = '100px Arial';
    x = left.x + leftMargin;
    y = Math.max(center.y + 1100, bottom.y - 1600);
    drawShadowText(ctx, 'What\'s a Film Jam?', x, y, 5, 5, 5, fill);

    y += 200; // 500
    drawShadowText(ctx, 'What if I don\'t how to make a movie?', x, y, 5, 5, 5, fill);

    y += 200; // 500
    drawShadowText(ctx, 'Who are the #filmmakers group?', x, y, 5, 5, 5, fill);
  });
}

/**
 * @param {string} filename
 * @param {HTMLCanvasElement} canvas
 */
function downloadImageFromCanvas(filename, canvas) {
  let a = document.createElement('a');
  a.setAttribute('download', filename);
  let dataURL = canvas.toDataURL('image/png');
  let url = dataURL.replace(/^data:image\/png/,'data:application/octet-stream');
  a.setAttribute('href', url);
  a.click();
}

/**
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} mx
 * @param {number} my
 */
function drawNumberSign(ctx, x, y, w, h, mx, my) {
  ctx.translate(x, y);

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 20;
  ctx.lineCap = 'round';

  ctx.beginPath();

  ctx.moveTo(mx, 0);
  ctx.lineTo(mx, h);
  
  ctx.moveTo(0, my);
  ctx.lineTo(w, my);

  ctx.moveTo(w - mx, 0);
  ctx.lineTo(w - mx, h);
  
  ctx.moveTo(0, h - my);
  ctx.lineTo(w, h - my);

  ctx.stroke();
  ctx.translate(-x, -y);
}

/**
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string} text 
 * @param {number} x
 * @param {number} y
 * @param {number} depth 
 * @param {number} dx
 * @param {number} dy
 * @param {string|CanvasGradient|CanvasPattern} fill
 */
function drawShadowText(ctx, text, x, y, depth, dx, dy, fill) {
  ctx.fillStyle = '#000000';
  for(let i = 0; i < depth; ++i) {
    ctx.fillText(text, x + i * dx, y + i * dy);
  }
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

/**
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string} text 
 * @param {number} x
 * @param {number} y
 * @param {number} depth 
 * @param {number} dx
 * @param {number} dy
 * @param {string|CanvasGradient|CanvasPattern} fill
 */
function drawFancyText(ctx, text, x, y, depth, dx, dy, fill) {
  ctx.fillStyle = '#000000';
  for(let i = 0; i < depth; ++i) {
    ctx.fillText(text, x + i * dx, y + i * dy);
  }

  ctx.filter = 'blur(8px)';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 10;
  ctx.strokeText(text, x, y);
  ctx.filter = 'none';

  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}