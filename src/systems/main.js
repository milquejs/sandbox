import {
  AnimationFrameLoop,
  AssetManager,
  EntityManager,
  Experimental,
  FlexCanvas,
  InputPort,
  Topic,
  TopicManager,
} from '@milquejs/milque';

import { BouncingBox } from './BouncingBox';
import { EffectManager } from './EffectManager';
import { ProviderManager } from './ProviderManager';
import { ScreenBounceConfiguration, ScreenBounceSystem } from './ScreenBounce';
import { SystemManager } from './SystemManager';
import { VelocitySystem } from './Velocity';

FlexCanvas.define();

// What I like about hooks, is that it is global scope WITHOUT singleton.
// Literally dependency inject whenever you need access to something
// and it's free! :D

// Isn't this just require()?

export async function main() {
  // Load
  const m = await createModule();

  await BouncingBox.onLoad(m);

  // Init
  provide(m, ScreenBounceConfiguration, {
    minScreenX: 0,
    minScreenY: 0,
    maxScreenX: m.display.width,
    maxScreenY: m.display.height,
  });

  /** @type {SystemManager<World>} */
  const systems = new SystemManager();
  systems.register(VelocitySystem);
  systems.register(ScreenBounceSystem);
  systems.register(MainSystem);

  FRAME.on(m.topics, 0, () => {
    // Updates
    for (let system of systems.values()) {
      let effect = m.effects.get(system);
      effect.open();
      let result = systems.run(m, system);
      effect.close();
      if (typeof result !== 'undefined') {
        // This is the end of this system!
        SYSTEM_RESULT.dispatch(m.topics, { system, result });
        effect.revert();
      }
    }

    // Draw
    m.tia.cls(m.ctx, 0x333333);
    m.bouncingBox.onDraw(m);
  });
  FRAME.on(m.topics, 10, () => {
    // Effects
    let results = [];
    for (let system of systems.values()) {
      let effect = m.effects.get(system);
      results.push(effect.apply());
    }
    Promise.all(results);
  });

  m.loop.start();
}

/**
 * @param {World} m
 */
function MainSystem(m) {
  useEffect(m, () => {
    m.bouncingBox.onCreate(m);
    return () => {
      m.bouncingBox.onDestroy(m);
    };
  });
  m.bouncingBox.onUpdate(m);

  let config = useProvider(m, ScreenBounceConfiguration);
  config.maxScreenX = m.display.width;
  config.maxScreenY = m.display.height;
}

/**
 * @template T
 * @param {World} m
 * @param {import('./ProviderManager').ProviderFunction<World, T>} provider
 * @param {T} [initial]
 */
export function provide(m, provider, initial = undefined) {
  m.providers.provide(m, provider, initial);
}

/**
 * @template T
 * @param {World} m
 * @param {import('@/systems/SystemManager').SystemFunction<any, any>} scope
 * @param {import('./ProviderManager').ProviderFunction<World, T>} provider
 * @param {T} [initial]
 */
export function provideFor(m, scope, provider, initial = undefined) {
  m.providers.provideFor(m, scope, provider, initial);
}

/**
 * @param {World} m
 */
export function useCurrentSystem(m) {
  const result =
    /** @type {import('./SystemManager').SystemContext<World, any>} */ (m)
      .current;
  if (!result) {
    throw new Error('Cannot use() outside of system scope.');
  }
  return result;
}

/**
 * @param {World} m
 * @param {import('./EffectManager').EffectHandler} handler
 * @param {import('./EffectManager').EffectDependencyList} [deps]
 */
export function useEffect(m, handler, deps = []) {
  const handle = useCurrentSystem(m);
  let effect = m.effects.get(handle);
  effect.capture(handler, deps);
}

/**
 * @template T
 * @param {World} m
 * @param {import('./ProviderManager').ProviderFunction<World, T>} provider
 * @returns {T}
 */
export function useProvider(m, provider) {
  const handle = useCurrentSystem(m);
  if (!m.providers.has(handle, provider)) {
    // By default, register globally.
    m.providers.provide(m, provider);
  }
  return m.providers.get(handle, provider);
}

export const PRE_FRAME = new Topic('SYSTEM.PREFRAME');
export const FRAME = new Topic('SYSTEM.FRAME');

/** @type {Topic<any>} */
export const SYSTEM_RESULT = new Topic('SYSTEM.RESULT');

/** @typedef {Awaited<ReturnType<createModule>>} World */
async function createModule() {
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
  const axb = inputs.getContext('axisbutton');
  const tia = new Experimental.Tia();
  const ents = new EntityManager();
  const bouncingBox = new BouncingBox();
  const assets = new AssetManager();

  const effects = new EffectManager();
  const providers = new ProviderManager();
  const topics = new TopicManager();

  let result = {
    display,
    inputs,
    ctx,
    axb,
    tia,
    ents,
    bouncingBox,
    assets,
    frame: createAnimationFrameDetail(),
    /** @type {AnimationFrameLoop} */
    loop: /** @type {any} */ (undefined),
    // ---
    effects,
    providers,
    topics,
  };
  result.loop = new AnimationFrameLoop((e) => {
    PRE_FRAME.dispatchImmediately(topics, e);
    // If it was cancelled early in M.FRAME, early out.
    if (!e.running) {
      return;
    }
    result.frame = e.detail;
    FRAME.dispatchImmediately(topics, e);
    topics.flush();
  });
  return result;
}

/** @returns {import('@milquejs/milque').AnimationFrameDetail} */
function createAnimationFrameDetail() {
  return {
    currentTime: -1,
    prevTime: -1,
    deltaTime: 0,
  };
}
