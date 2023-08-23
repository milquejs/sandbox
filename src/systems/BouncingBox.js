import { Position } from './Position';
import { Velocity } from './Velocity';
import { ScreenBounceTopic, ScreenBounce, ScreenBounceEvent } from './ScreenBounce';
import { ComponentClass, EntityManager, Random } from '@milquejs/milque';
import sheepPngAsset from '@/assets/sheep.png.asset';
import { useProvider } from '../main';
import { FrameProvider } from './FrameProvider';

export class BouncingBox {
  x = 0;
  y = 0;
  dx = 1;
  dy = 1;
  angles = 0;
  dangles = 1;
  entityId = 0;

  /** @param {import('../main').World} m */
  static async onLoad(m) {
    await sheepPngAsset.load(m.assets);
  }
  
  constructor() {
    this.onBounce = this.onBounce.bind(this);
  }

  /** @param {import('../main').World} m */
  onCreate(m) {
    const { topics } = useProvider(m, FrameProvider);
    this.entityId = createAs(m.ents, this, Position, Velocity, ScreenBounce);
    ScreenBounceTopic.on(topics, 0, this.onBounce);
  }

  /** @param {import('../main').World} m */
  onDestroy(m) {
    m.ents.destroy(this.entityId);
  }

  /** @param {import('../main').World} m */
  onUpdate(m) {
    this.angles += this.dangles;
  }

  /** @param {ScreenBounceEvent} e */
  onBounce(e) {
    if (e.entityId !== this.entityId) {
      return;
    }
    this.dangles = Random.sign();
  }

  /** @param {import('../main').World} m */
  onDraw(m) {
    const { ctx, tia } = m;
    tia.push();
    tia.matPos(this.x, this.y);
    tia.matRot(this.angles);
    if (!sheepPngAsset.current) {
      throw new Error('Missing sheep png');
    }
    tia.spr(ctx, sheepPngAsset.current, 0, -64, -64, 128, 128);
    tia.pop();
  }
}

// Returns a promise to load things, before running.
// useEffect for lifecycle calls. Easy to encapsulate logical behavior.

/**
 * @param {EntityManager} ents 
 * @param {any} instance 
 * @param  {...ComponentClass<any>} componentClasses 
 */
export function createAs(ents, instance, ...componentClasses) {
  const entityId = ents.create();
  for(let componentClass of componentClasses) {
    ents.attachImmediately(entityId, componentClass, instance);
  }
  return entityId;
}
