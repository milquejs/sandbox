import { InputContext, Random, lerp } from '@milquejs/milque';
import { drawSprite } from './main';
import wizardPngAsset from '../assets/wizard.png.asset';
import { Timer } from '../util/Timer';

export class WizardSpawner {
  /** @type {Array<Wizard>} */
  objects = [];
  spawn() {
    let result = new Wizard();
    this.objects.push(result);
    return result;
  }
}

export class Wizard {
  static IMAGE = wizardPngAsset;
  x = 0;
  y = 0;
  spriteIndex = Random.range(0, Wizard.IMAGE.opts.spriteCount);
  // This technically doesn't need to be here.
  behavior = new WizardBehavior();
}

/**
 * @param {import('@milquejs/milque').AssetManager} assets 
 */
export async function loadWizard(assets) {
  await Wizard.IMAGE.load(assets);
}

/**
 * 
 * @param {InputContext} axb 
 * @param {import('./Tio').Tio<?>} tio 
 * @param {Timer} wizardSpawnTimer 
 * @param {WizardSpawner} wizardSpawner 
 */
export function inputWizard(axb, tio, wizardSpawnTimer, wizardSpawner) {
  if (tio.hold(axb, 'click')) {
    if (wizardSpawnTimer.done()) {
      let w = wizardSpawner.spawn();
      w.x = tio.posX(axb);
      w.y = tio.posY(axb);
      wizardSpawnTimer.reset();
    }
  }
}

/**
 * @param {import('@milquejs/milque').AnimationFrameDetail} frame 
 * @param {Wizard} wizard 
 */
export function updateWizard(frame, wizard) {
  if (wizard.behavior.status === 'wander') {
    let moveSpeed = wizard.behavior.moveSpeed;
    let dx = wizard.behavior.targetX - wizard.x;
    let dy = wizard.behavior.targetY - wizard.y;
    let dir = Math.atan2(dy, dx);
    let xx = Math.cos(dir) * moveSpeed;
    let yy = Math.sin(dir) * moveSpeed;
    wizard.x += xx;
    wizard.y += yy;
  }
  wizard.spriteIndex += frame.deltaTime / 140;
}

export function findCollisions(wizard, wizardSpawner) {
  let halfw = Wizard.IMAGE.opts.spriteWidth / 2;
  let halfh = Wizard.IMAGE.opts.spriteHeight / 2;
  let result = [];
  for(let other of wizardSpawner.objects) {
    if (wizard === other) continue;
    if (wizard.x - other.x >= halfw * 2) continue;
    if (wizard.y - other.y >= halfh * 2) continue;
    result.push(other);
  }
  return result;
}

export function collideWizard(wizard, others) {
  let r = (Wizard.IMAGE.opts.spriteWidth + Wizard.IMAGE.opts.spriteHeight) / 2;
  let minDX = 0;
  let minDY = 0;
  let minL = Number.MAX_VALUE;
  for(let other of others) {
    let dx = wizard.x - other.x;
    let dy = wizard.y - other.y;
    let l = Math.sqrt(dx * dx + dy * dy);
    if (l < minL) {
      minL = l;
      minDX = dx;
      minDY = dy;
    }
  }
  if (minL > 0.1 && minL < r / 2) {
    wizard.x = lerp(wizard.x, wizard.x + minDX, 0.01);
    wizard.y = lerp(wizard.y, wizard.y + minDY, 0.01);
  }
}

const MOVE_SPEED_RANGE = [0.3, 0.8];
const BEHAVE_TIMER_RANGE = [1_000, 3_000];

export class WizardBehavior {
  targetX = 0;
  targetY = 0;
  moveSpeed = Random.range(MOVE_SPEED_RANGE[0], MOVE_SPEED_RANGE[1]);
  status = 'idle';
  timer = new Timer(BEHAVE_TIMER_RANGE[0]);
  constructor() {
    this.timer.start();
  }
}

/**
 * @param {WizardBehavior} behavior 
 * @param {Wizard} wizard 
 * @param {import('@milquejs/milque').FlexCanvas} canvas
 */
export function behaveWizard(behavior, wizard, canvas) {
  if (!behavior.timer.done()) {
    return;
  }
  switch(behavior.status) {
    case 'idle':
      if (Random.next() < 0.6) {
        behavior.status = 'wander';
        behavior.targetX = Random.range(0, canvas.width);
        behavior.targetY = Random.range(0, canvas.height);
      }
      break;
    case 'wander':
      if (Random.next() < 0.6) {
        behavior.status = 'idle';
      }
      break;
  }
  behavior.timer.setTimeout(Random.range(BEHAVE_TIMER_RANGE[0], BEHAVE_TIMER_RANGE[1]))
  behavior.timer.reset();
}

/**
 * @param {import('@milquejs/milque').AssetManager} assets 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {import('@milquejs/milque').Experimental.Tia} tia 
 * @param {Wizard} wizard 
 */
export function drawWizard(assets, ctx, tia, wizard) {
  tia.push();
  tia.matPos(wizard.x, wizard.y);
  tia.matRot(Math.sin(wizard.spriteIndex) * 4);
  drawSprite(assets, tia, ctx, Wizard.IMAGE, wizard.spriteIndex, 0, 0);
  tia.pop();
}
