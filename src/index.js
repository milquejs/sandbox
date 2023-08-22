import {
  AnimationFrameLoop,
  AssetManager,
  AsyncTopic,
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
import { Skellies } from './systems/Skelly';
import { Spells } from './systems/Spells';
import { TapButton } from './systems/TapButton';
import { Timer } from './systems/Timer';
import { Wizard } from './systems/Wizard';

FlexCanvas.define();

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

/** @type {AsyncTopic<World>} */
export const WORLD_LOAD = new AsyncTopic('worldLoad');
/** @type {Topic<World>} */
export const WORLD_UPDATE = new Topic('worldUpdate');
/** @type {Topic<World>} */
export const WORLD_RENDER = new Topic('worldRender');

async function main() {
  const world = createWorld();

  const { axb } = world;
  CURSOR_X.bindKeys(axb);
  CURSOR_Y.bindKeys(axb);
  CLICK.bindKeys(axb);

  // Initialize...
  world.systems.register(Particles, Particles(world));
  world.systems.register(Particles, Particles(world));
  world.systems.register(Masks, new Masks(world));
  world.systems.register(Box, Box(world));
  world.systems.register(Timer, Timer(world));
  world.systems.register(Button, new Button(world));
  world.systems.register(Intro, Intro(world));
  world.systems.register(Hand, Hand(world));
  world.systems.register(TapButton, TapButton(world));
  world.systems.register(Camera, new Camera(world));
  world.systems.register(Room, Room(world));
  world.systems.register(Wizard, Wizard(world));
  world.systems.register(Spells, Spells(world));
  world.systems.register(Skellies, Skellies(world));

  await WORLD_LOAD.dispatchImmediately(world.topics, world);

  // Start!
  world.loop.start();
}

/** @typedef {ReturnType<createWorld>} World */

function createWorld() {
  const assets = new AssetManager();
  const topics = new TopicManager();
  const ents = new EntityManager();
  const systems = new SystemManager();

  const display = new FlexCanvas({
    root: document.body,
    sizing: 'viewport',
    width: 600,
    height: 400,
    aspectRatio: 600 / 400,
  });
  display.id = 'display';
  const inputs = InputPort.create({ for: 'display' });
  inputs.style.display = 'none';

  const ctx = display.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const axb = inputs.getContext('axisbutton');
  const tia = new Experimental.Tia();

  let result = {
    display,
    canvas: display,
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
    loop: new AnimationFrameLoop((e) => {
      result.frame = e.detail;
      result.axb.poll(e.detail.currentTime);

      ents.flush();
      topics.dispatchImmediately(WORLD_UPDATE, result);

      const { ctx, tia } = result;
      tia.camera(0, 0);
      tia.cls(ctx, 0x333333);
      topics.dispatchImmediately(WORLD_RENDER, result);

      topics.flush();
    }),
  };
  
  return result;
}

/**
 * @template T
 * @param {World} m
 * @param {import('./SystemManager').SystemFunction<T>} system
 */
export function use(m, system) {
  return m.systems.get(system);
}

/**
 * @template T
 * @param {World} m
 * @param {Topic<T>} topic
 * @param {number} priority
 * @param {import('@milquejs/milque').TopicCallback<T>} callback
 * @returns
 */
export function when(m, topic, priority, callback) {
  return topic.on(m.topics, priority, callback);
}
