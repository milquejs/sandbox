import {
  AnimationFrameLoop,
  AssetManager,
  AxisBinding,
  ButtonBinding,
  EntityManager,
  Experimental,
  FlexCanvas,
  InputPort,
  KeyCodes,
  Topic,
  TopicManager,
} from '@milquejs/milque';

import { SystemManager } from './SystemManager';
import BUTTON from './assets/button.png.asset';
import ghostPngAsset from './assets/ghost.png.asset';
import GLYPH from './assets/glyph.png.asset';
import HAND from './assets/hand.png.asset';
import NUMS from './assets/nums.png.asset';
import SPLAT from './assets/splat.png.asset';
import TAP_BUTTON from './assets/tap_button.png.asset';
import WIZARD from './assets/wizard.png.asset';
import './error';
import './reload';
import { Box } from './systems/Box';
import { Button } from './systems/Button';
import { Camera } from './systems/Camera';
import { Hand } from './systems/Hand';
import { Intro } from './systems/Intro';
import { Masks } from './systems/Masks';
import { Particles } from './systems/Particles';
import { Room } from './systems/Room';
import { Spells } from './systems/Spells';
import { TapButton } from './systems/TapButton';
import { Timer } from './systems/Timer';
import { Wizard, createWizard } from './systems/Wizard';

window.addEventListener('DOMContentLoaded', main);

/**
 * What does this button do?
 * Restriction: 60 secs to win.
 *
 *
 * It's a rogue-like. There's a dungeon but you are the
 * hand. At the start of the game a timer starts, 60 secs.
 *
 * You can explore the dungeon and push buttons, which does stuff.
 * Some open doors. Some start traps. Some spawn goblins.
 *
 * But adventurers are at the door and you've been awoken.
 *
 * It's 60 seconds until they break down the door and storm in!
 */

export const CURSOR_X = new AxisBinding('cursorX', KeyCodes.MOUSE_POS_X);
export const CURSOR_Y = new AxisBinding('cursorY', KeyCodes.MOUSE_POS_Y);
export const CLICK = new ButtonBinding('click', [
  KeyCodes.MOUSE_BUTTON_0,
  KeyCodes.MOUSE_BUTTON_2,
]);

/** @type {Topic<World>} */
export const WORLD_UPDATE = new Topic('worldUpdate');
/** @type {Topic<World>} */
export const WORLD_RENDER = new Topic('worldRender');

async function main() {
  const assets = new AssetManager();
  await NUMS.load(assets);
  await BUTTON.load(assets);
  await HAND.load(assets);
  await GLYPH.load(assets);
  await TAP_BUTTON.load(assets);
  await WIZARD.load(assets);
  await SPLAT.load(assets);
  await ghostPngAsset.load(assets);

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

  const frameLoop = new AnimationFrameLoop((e) => {
    world.frame = e.detail;
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
  systems.register(Particles, Particles(world));
  systems.register(Masks, Masks(world));
  systems.register(Box, Box(world));
  systems.register(Timer, Timer(world));
  systems.register(Button, Button(world));
  systems.register(Intro, Intro(world));
  systems.register(Hand, Hand(world));
  systems.register(TapButton, TapButton(world));
  systems.register(Camera, new Camera(world));
  systems.register(Room, Room(world));
  systems.register(Wizard, Wizard(world));
  systems.register(Spells, Spells(world));

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
  const ctx = /** @type {CanvasRenderingContext2D} */ (
    display.getContext('2d')
  );
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
    /** @type {import('@milquejs/milque').AnimationFrameDetail} */
    frame: {
      prevTime: 0,
      currentTime: 0,
      deltaTime: 0,
    },
  };
}

/**
 * @template T
 * @param {World} m
 * @param {import('./SystemManager').SystemFunction<T>} system
 */
export function use(m, system) {
  return m.systems.get(system);
}
