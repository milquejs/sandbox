import { AnimationFrameLoop, FlexCanvas, Experimental } from '@milquejs/milque';
import './error';
import './reload';

const { Tia } = Experimental;

window.addEventListener('DOMContentLoaded', main);
async function main() {
  const flexCanvas = FlexCanvas.create({
    sizing: 'viewport',
    scaling: 'scale',
    width: 600,
    height: 400,
  });
  const ctx = /** @type {CanvasRenderingContext2D} */ (flexCanvas.getContext('2d'));
  const tia = new Tia();

  const BOX_SIZE = 100;
  let box = { x: 0, y: 0, dx: 1, dy: 1 };

  const frameLoop = new AnimationFrameLoop(e => {

    box.x += box.dx;
    box.y += box.dy;

    if (box.x < 0 || box.x > flexCanvas.width) {
      box.x = Math.min(Math.max(0, box.x), flexCanvas.width);
      box.dx *= -1;
    }

    if (box.y < 0 || box.y > flexCanvas.height) {
      box.y = Math.min(Math.max(0, box.y), flexCanvas.height);
      box.dy *= -1;
    }

    tia.camera(0, 0, flexCanvas.width, flexCanvas.height);
    tia.cls(ctx, 0x333333);
    tia.rectFill(ctx, box.x - BOX_SIZE / 2, box.y - BOX_SIZE / 2, box.x + BOX_SIZE / 2, box.y + BOX_SIZE / 2, 0xFF0000);
  });
  frameLoop.start();
}
