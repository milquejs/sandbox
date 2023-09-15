import {
  AnimationFrameLoop,
  AssetManager,
  Experimental,
  FlexCanvas,
  InputPort,
} from '@milquejs/milque';

import { Tio } from '../Tio';
import dirtPngAsset from '../assets/dirt.png.asset';
import sheepPngAsset from '../assets/sheep.png.asset';
import applePngAsset from '../assets/apple.png.asset';
import { SystemManager } from '../attempt1/SystemManager';

FlexCanvas.define();

/**
 * @param {AssetManager} assets 
 */
async function load(assets) {
  await dirtPngAsset.load(assets);
  await sheepPngAsset.load(assets);
  await applePngAsset.load(assets);
}

/** @typedef {ReturnType<createContext>} M */

function createContext() {
  const systems = new SystemManager();
  return {
    systems,
  };
}

export async function main() {
  const assets = new AssetManager();
  await load(assets);

  const m = createContext();
  m.systems.run(m, Display);
  m.systems.run(m, Renderer);
  m.systems.run(m, Input);
  m.systems.run(m, Loop);
  m.systems.register(Sheep);
}

/**
 * @param {any} m
 */
function Input(m) {
  const { inputs } = useContext(m, Display);
  const axb = inputs.getContext('axisbutton');
  const tio = new Tio(Tio.DEFAULT_BINDINGS);
  tio.bindKeys(axb);
  return {
    axb,
    tio,
  };
}

/**
 * @param {any} m
 */
function Display(m) {
  const canvas = new FlexCanvas({
    root: document.body,
    sizing: 'viewport',
    width: 640,
    height: 480,
    aspectRatio: 640 / 480,
  });
  canvas.id = 'display';
  const inputs = InputPort.create({
    for: 'display'
  });
  inputs.style.display = 'none';
  return {
    canvas,
    inputs,
  };
}

/**
 * @param {any} m
 */
function Renderer(m) {
  const { canvas } = useContext(m, Display);
  const ctx = canvas.getContext('2d');
  const tia = new Experimental.Tia();
  return {
    ctx,
    tia,
  };
}

/**
 * @param {any} m
 */
function Loop(m) {
  const result = {
    loop: new AnimationFrameLoop((loop) => {
      result.frame = loop.detail;
      for(let system of m.systems.values()) {
        m.systems.run(m, system);
      }
    }),
    frame: createAnimationFrameDetail(),
  };
  result.loop.start();
  return result;
}

/**
 * @template T
 * @param {M} m 
 * @param {import('../attempt1/SystemManager').SystemFunction<any, T>} handle 
 * @returns {T}
 */
function useContext(m, handle) {
  let result = m.systems.context(handle);
  if (!result) {
    throw new Error('Missing provider.');
  }
  return result;
}

/**
 * @param {any} m
 */
function Sheep(m) {
  const { ctx, tia } = useContext(m, Renderer);
  const { axb, tio } = useContext(m, Input);
  const { frame } = useContext(m, Loop);

  tia.cls(ctx, 0x333333);
  tia.camera(0, 0);

  tia.push();
  tia.matPos(64, 64);
  tia.matRot(Math.sin(frame.currentTime / 100) * 4);
  drawSheep(ctx, tia, 0, 0);
  tia.pop();

  // tio.poll(axb);
  // tio.camera(0, 0, canvas.width, canvas.height);

  drawApple(ctx, tia, 64, 64);
}

/**
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Experimental.Tia} tia 
 * @param {number} x 
 * @param {number} y 
 */
function drawApple(ctx, tia, x, y) {
  if (!applePngAsset.current) {
    throw new Error('Missing apple.png');
  }
  let w = applePngAsset.opts.spriteWidth;
  let h = applePngAsset.opts.spriteHeight;
  tia.spr(ctx,
    applePngAsset.current, 0,
    x - w / 2, y - h / 2,
    w, h);
}

/**
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Experimental.Tia} tia 
 * @param {number} x 
 * @param {number} y 
 * @param {boolean} [flipX]
 */
function drawSheep(ctx, tia, x, y, flipX = false) {
  if (!sheepPngAsset.current) {
    throw new Error('Missing sheep.png');
  }
  let w = sheepPngAsset.opts.spriteWidth;
  let h = sheepPngAsset.opts.spriteHeight;
  tia.spr(ctx,
    sheepPngAsset.current, 0,
    x - w / 2, y - h / 2,
    w, h, flipX);
}

/** @returns {import('@milquejs/milque').AnimationFrameDetail} */
function createAnimationFrameDetail() {
  return {
    currentTime: -1,
    prevTime: -1,
    deltaTime: 0,
  };
}
