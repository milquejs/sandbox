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
  const frameLoop = new AnimationFrameLoop(e => {
    tia.camera(0, 0, flexCanvas.width, flexCanvas.height);
    tia.cls(ctx, 0x00FF00);
    tia.rectFill(ctx, 0, 0, 100, 100, 0xFF0000);
  });
  frameLoop.start();
}
