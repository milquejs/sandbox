import { AnimationFrameLoop, FlexCanvas, Experimental, AssetManager, InputPort, AxisBinding, KeyCodes, ButtonBinding, Topic, TopicManager, EntityManager } from '@milquejs/milque';
import './error';
import './reload';

import { SystemManager } from './SystemManager';

import { Box } from './systems/Box';
import { Timer } from './systems/Timer';
import { Button } from './systems/Button';

import NUMS from './assets/nums.png.asset';
import BUTTON from './assets/button.png.asset';

window.addEventListener('DOMContentLoaded', main);

/**
 * What does this button do?
 * Restriction: 60 secs to win.
 */

export const CURSOR_X = new AxisBinding('cursorX', KeyCodes.MOUSE_POS_X);
export const CURSOR_Y = new AxisBinding('cursorY', KeyCodes.MOUSE_POS_Y);
export const CLICK = new ButtonBinding('click', [KeyCodes.MOUSE_BUTTON_0, KeyCodes.MOUSE_BUTTON_2]);

/** @type {Topic<World>} */
export const WORLD_UPDATE = new Topic('worldUpdate');
/** @type {Topic<World>} */
export const WORLD_RENDER = new Topic('worldRender');

async function main() {
  const assets = new AssetManager();
  await NUMS.load(assets);
  await BUTTON.load(assets);

  const topics = new TopicManager();
  const ents = new EntityManager();
  const systems = new SystemManager();

  const display = FlexCanvas.create({
    id: 'display',
    sizing: 'viewport',
    scaling: 'scale',
    width: 600,
    height: 400,
  });
  const inputs = InputPort.create({ for: 'display' });
  inputs.style.display = 'none';

  const world = createWorld(display, inputs, assets, topics, ents, systems);

  const frameLoop = new AnimationFrameLoop(e => {
    world.axb.poll(e.detail.currentTime);

    ents.flush();
    topics.dispatchImmediately(WORLD_UPDATE, world);

    const { ctx, display, tia } = world;
    tia.camera(0, 0, display.width, display.height);
    tia.cls(ctx, 0x333333);
    topics.dispatchImmediately(WORLD_RENDER, world);

    topics.flush();
  });

  // Initialize...
  systems.register(Box, Box(world));
  systems.register(Timer, Timer(world));
  systems.register(Button, Button(world));

  // Start!
  frameLoop.start();
}

/** @typedef {ReturnType<createWorld>} World */

/**
 * @param {FlexCanvas} display
 * @param {InputPort} inputs
 * @param {AssetManager} assets
 * @param {TopicManager} topics
 * @param {EntityManager} ents
 * @param {SystemManager} systems
 */
function createWorld(display, inputs, assets, topics, ents, systems) {
  const ctx = /** @type {CanvasRenderingContext2D} */ (display.getContext('2d'));
  ctx.imageSmoothingEnabled = false;
  const axb = inputs.getContext('axisbutton');
  const tia = new Experimental.Tia();

  CURSOR_X.bindKeys(axb);
  CURSOR_Y.bindKeys(axb);
  CLICK.bindKeys(axb);
  
  return {
    display,
    inputs,
    assets,
    topics,
    ents,
    systems,
    tia,
    ctx,
    axb,
  };
}
