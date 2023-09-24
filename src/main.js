import { AnimationFrameLoop, Experimental, FlexCanvas, InputContext } from '@milquejs/milque';

FlexCanvas.define();

// What I like about hooks, is that it is global scope WITHOUT singleton.
// Literally dependency inject whenever you need access to something
// and it's free! :D

// Isn't this just require()?

export async function main() {
  const canvas = new FlexCanvas({
    root: document.body,
    width: 640,
    height: 480,
    aspectRatio: 640 / 480,
  });
  const ctx = canvas.getContext('2d');
  const tia = new Experimental.Tia();
  const axb = new InputContext(canvas);
  const tio = new Experimental.Tio(Experimental.Tio.DEFAULT_BINDINGS);
  const loop = new AnimationFrameLoop();
  loop.start(loop => {
    axb.poll(loop.detail.currentTime);
    tia.cls(ctx, 0x111111);
  });
}
