import { AnimationFrameLoop, FlexCanvas, InputContext } from '@milquejs/milque';

import { Game } from './game/Game';

import { MainScene } from './v2/MainScene';

FlexCanvas.define();

export async function main() {
  const canvas = new FlexCanvas({
    root: document.body,
    width: 640,
    height: 480,
    aspectRatio: 640 / 480,
  });
  const loop = new AnimationFrameLoop();

  const mainScene = new MainScene();
  
  const game = new Game([mainScene], [mainScene], canvas.getContext('2d'), new InputContext(canvas));
  await game.init();

  loop.start((e) => game.run(e.detail));
}
