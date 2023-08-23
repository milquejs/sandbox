import { AssetManager, EntityManager, Experimental, FlexCanvas, InputPort } from '@milquejs/milque';
import { VelocitySystem } from './systems/Velocity';
import { ScreenBounceConfiguration, ScreenBounceSystem } from './systems/ScreenBounce';
import { BouncingBox } from './systems/BouncingBox';
import { ProviderManager } from './systems/ProviderManager';
import { FRAME, FrameProvider } from './systems/FrameProvider';
import { SystemManager } from './systems/SystemManager';
import { EffectManager } from './systems/EffectManager';

FlexCanvas.define();

// What I like about hooks, is that it is global scope WITHOUT singleton.
// Literally dependency inject whenever you need access to something
// and it's free! :D

export async function main() {
  // Load
  const m = await createModule();

  /** @type {SystemManager<World>} */
  const systems = new SystemManager();
  systems.register(VelocitySystem);
  systems.register(ScreenBounceSystem);
  systems.register(MainSystem);

  // Init
  provide(m, ScreenBounceConfiguration, {
    minScreenX: 0,
    minScreenY: 0,
    maxScreenX: m.display.width,
    maxScreenY: m.display.height,
  });
  provide(m, FrameProvider);

  await BouncingBox.onLoad(m);

  const { topics, loop } = m.providers.get(null, FrameProvider);
  FRAME.on(topics, 0, () => {    
    // Updates
    for(let system of systems.values()) {
      if (!m.effects.has(system)) {
        m.effects.register(system);
      }
      let effect = m.effects.get(system);
      effect.open();
      systems.run(m, system);
      effect.close();
    }

    // Draw
    m.tia.cls(m.ctx, 0x333333);
    m.bouncingBox.onDraw(m);
  });
  FRAME.on(topics, 10, () => {
    // Effects
    let results = [];
    for(let system of systems.values()) {
      let effect = m.effects.get(system);
      results.push(effect.apply());
    }
    Promise.all(results);
  });

  loop.start();
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
  }, []);
  m.bouncingBox.onUpdate(m);
  
  let config = useProvider(m, ScreenBounceConfiguration);
  config.maxScreenX = m.display.width;
  config.maxScreenY = m.display.height;
}

/**
 * @template T
 * @param {World} m 
 * @param {import('./systems/ProviderManager').ProviderFunction<World, T>} provider 
 * @param {T} [initial]
 */
export function provide(m, provider, initial = undefined) {
  m.providers.provide(m, provider, initial);
}

/**
 * @template T
 * @param {World} m 
 * @param {import('@/systems/SystemManager').SystemFunction<any>} scope
 * @param {import('./systems/ProviderManager').ProviderFunction<World, T>} provider 
 * @param {T} [initial]
 */
export function provideFor(m, scope, provider, initial = undefined) {
  m.providers.provideFor(m, scope, provider, initial);
}

/**
 * @param {World} m
 */
export function useCurrentSystem(m) {
  const result = /** @type {import('./systems/SystemManager').SystemContext<World>} */ (m).current;
  if (!result) {
    throw new Error('Cannot use() outside of system scope.');
  }
  return result;
}

/**
 * @param {World} m 
 * @param {import('./systems/EffectManager').EffectHandler} handler 
 * @param {import('./systems/EffectManager').EffectDependencyList} [deps]
 */
export function useEffect(m, handler, deps = []) {
  const handle = useCurrentSystem(m);
  let effect = m.effects.get(handle);
  effect.capture(handler, deps);
}

/**
 * @template T
 * @param {World} m 
 * @param {import('./systems/ProviderManager').ProviderFunction<World, T>} provider
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

  let result = {
    display,
    inputs,
    ctx,
    axb,
    tia,
    ents,
    bouncingBox,
    assets,
    // ---
    effects,
    providers,
  };
  return result;
}
