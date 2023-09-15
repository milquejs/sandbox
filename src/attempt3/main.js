import { AnimationFrameLoop, AssetManager, AssetRef, Experimental, FlexCanvas, InputContext } from '@milquejs/milque';
import { Tio } from '../Tio';
import { Timer } from '../util/Timer';
import { WizardSpawner, behaveWizard, collideWizard, drawWizard, findCollisions, inputWizard, loadWizard, updateWizard } from './Wizard';

FlexCanvas.define();

export async function main() {
  const canvas = new FlexCanvas({
    root: document.body,
    sizing: 'viewport',
    width: 640,
    height: 480,
    aspectRatio: 640 / 480,
  });
  const assets = new AssetManager();
  const axb = new InputContext(canvas);
  const ctx = canvas.getContext('2d');
  const tia = new Experimental.Tia();
  const tio = new Tio(Tio.DEFAULT_BINDINGS);
  tio.bindKeys(axb);

  await loadWizard(assets);

  const wizardSpawnTimer = new Timer(50);
  const wizardSpawner = new WizardSpawner();
  wizardSpawner.spawn();
  wizardSpawnTimer.start();

  const loop = new AnimationFrameLoop(loop => {
    tia.camera(0, 0, canvas.width, canvas.height);
    tia.cls(ctx, 0x333333);

    axb.poll(loop.detail.currentTime);
    tio.camera(0, 0, canvas.width, canvas.height);
    if (tio.hold(axb, 'click')) {
      tia.circ(ctx, tio.posX(axb), tio.posY(axb), 10, 0xff0000);
    } else {
      tia.circ(ctx, tio.posX(axb), tio.posY(axb), 10, 0x00ff00);
    }
    
    inputWizard(axb, tio, wizardSpawnTimer, wizardSpawner);
    for(let wizard of wizardSpawner.objects) {
      let collisions = findCollisions(wizard, wizardSpawner);
      collideWizard(wizard, collisions);
      updateWizard(loop.detail, wizard);
      behaveWizard(wizard.behavior, wizard, canvas);
    }
    let sorted = wizardSpawner.objects.slice().sort((a, b) => a.y - b.y);
    for(let w of sorted) {
      drawWizard(assets, ctx, tia, w);
    }
  });
  loop.start();
}

/**
 * @template {{ spriteWidth: number, spriteHeight: number, spriteCount: number }} S
 * @param {AssetManager} assets
 * @param {Experimental.Tia} tia 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {import('@milquejs/milque').AssetRef<HTMLImageElement, S>} imageAsset 
 * @param {number} spriteIndex
 * @param {number} x 
 * @param {number} y 
 */
export function drawSprite(assets, tia, ctx, imageAsset, spriteIndex, x, y) {
  tia.spr(ctx, getAsset(assets, imageAsset),
    Math.trunc(spriteIndex) % imageAsset.opts.spriteCount,
    x - imageAsset.opts.spriteWidth / 2, y - imageAsset.opts.spriteHeight / 2,
    imageAsset.opts.spriteWidth,
    imageAsset.opts.spriteHeight);
}

/**
 * @template T
 * @template {object} S
 * @param {AssetManager} assets 
 * @param {AssetRef<T, S>} assetRef
 */
export function getAsset(assets, assetRef) {
  let result = assetRef.get(assets);
  if (!result) {
    throw new Error(`Asset not yet loaded! uri='${assetRef.uri}'`);
  }
  return result;
}
