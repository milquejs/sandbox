import { AnimationFrameLoop, AssetManager, Experimental, FlexCanvas, InputContext, Random, Topic } from '@milquejs/milque';
import { Tio } from './Tio';
import { TileMap } from './util/TileMap';

FlexCanvas.define();

export async function main() {
  const world = new World();
  const loop = new AnimationFrameLoop(loop => {
    world.frame = loop.detail;
    world.update();
    world.draw();
  });
  loop.start();
}

class World {
  canvas = new FlexCanvas({
    root: document.body,
    sizing: 'viewport',
    width: 640,
    height: 480,
    aspectRatio: 640 / 480,
  });
  ctx = this.canvas.getContext('2d');
  axb = new InputContext(this.canvas);
  tia = new Experimental.Tia();
  tio = new Tio(Tio.DEFAULT_BINDINGS);
  assets = new AssetManager();
  frame = /** @type {import('@milquejs/milque').AnimationFrameDetail} */({});
  dt = 0;

  tileMap = new TileMap(16, 16);

  update() {
    this.dt = this.frame.deltaTime / 60;
  }

  draw() {
    this.tia.cls(this.ctx);
    drawTileMap(this);
  }
}

/**
 * @param {World} world 
 */
function drawTileMap(world) {
  for(let [x, y, value] of world.tileMap.entries()) {

  }
}
