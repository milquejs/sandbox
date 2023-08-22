import { Random } from '@milquejs/milque';

import * as glyphPngParams from '@/assets/glyph.png.asset';
import wizardPngAsset, {
  FRAME_COUNT,
  FRAME_HEIGHT,
  FRAME_WIDTH,
} from '@/assets/wizard.png.asset';

import {
  CLICK,
  CURSOR_X,
  CURSOR_Y,
  WORLD_LOAD,
  WORLD_RENDER,
  WORLD_UPDATE,
} from '../index';
import { drawSpriteUV } from '../util/SpriteUV';
import { Hand } from './Hand';
import { Masks, createMask, updateMaskPositionFromCenter } from './Masks';
import { Particles } from './Particles';
import { Room } from './Room';
import { Spells } from './Spells';
import { Timer } from './Timer';

/** @typedef {ReturnType<createWizard>} Wizard */

const MOVE_SPEED = 0.3;
const MASK_OFFSET_X = 0;
const MASK_OFFSET_Y = -4;
const MASK_WIDTH = FRAME_WIDTH / 2;
const MASK_HEIGHT = FRAME_HEIGHT * 0.6;

const SPELL_SPEED = 10;
const SPELL_COOLDOWN = 500;

/**
 * @param {import('../index').World} world
 */
export function Wizard(world) {
  /** @type {Array<Wizard>} */
  let list = [];
  let spawnTimer = 0;
  let maxSpawnTimer = 1000;

  WORLD_LOAD.on(world.topics, 0, onLoad);
  WORLD_UPDATE.on(world.topics, 0, () => {
    const room = world.systems.get(Room);
    const wizards = world.systems.get(Wizard);
    if (room.state !== 'lose') {
      if (wizards.spawnTimer-- <= 0) {
        let w = createWizard();
        if (Random.next() > 0.5) {
          w.x = 0 - 100;
          w.y = Random.range(0, world.display.height);
        } else {
          w.x = world.display.width + 100;
          w.y = Random.range(0, world.display.height);
        }
        wizards.spawnWizard(world, w);
        maxSpawnTimer *= 0.8;
        wizards.spawnTimer = Math.max(
          5,
          Random.range(maxSpawnTimer / 2, maxSpawnTimer),
        );
      }
      for (let wizard of list) {
        updateWizard(world, wizard);
      }
    } else {
      for (let wizard of list) {
        blowUpWizard(world, wizard);
      }
    }
  });
  WORLD_RENDER.on(world.topics, 0, () => {
    for (let wizard of list) {
      renderWizard(world, wizard);
    }
  });

  return {
    spawnTimer,
    maxSpawnTimer,
    list,
    spawnWizard,
    despawnWizard,
  };
}

/**
 * @param {import('../index').World} m 
 */
async function onLoad(m) {
  await wizardPngAsset.load(m.assets);
}

export function createWizard() {
  return {
    x: 0,
    y: 0,
    spriteIndex: 0,
    mask: createMask(
      MASK_OFFSET_X + MASK_WIDTH / 2,
      MASK_OFFSET_Y + MASK_HEIGHT / 2,
      MASK_WIDTH / 2,
      MASK_HEIGHT / 2,
    ),
    spellCooldown: Random.range(0, SPELL_COOLDOWN),
  };
}

/**
 * @param {import('../index').World} world
 * @param {Wizard} wizard
 */
function spawnWizard(world, wizard) {
  const wizards = world.systems.get(Wizard);
  wizards.list.push(wizard);
  const masks = world.systems.get(Masks);
  masks.spawnMask(world, wizard.mask);
}

/**
 * @param {import('../index').World} world
 * @param {Wizard} wizard
 */
function despawnWizard(world, wizard) {
  const wizards = world.systems.get(Wizard);
  let i = wizards.list.indexOf(wizard);
  if (i >= 0) {
    wizards.list.splice(i, 1);
  }
  const masks = world.systems.get(Masks);
  masks.despawnMask(world, wizard.mask);
}

/**
 * @param {import('../index').World} world
 * @param {Wizard} wizard
 */
function updateWizard(world, wizard) {
  wizard.spriteIndex += world.frame.deltaTime / 100;
  let hand = world.systems.get(Hand);
  let dx = hand.handX - wizard.x;
  let dy = hand.handY - wizard.y;
  let rads = Math.atan2(dy, dx);
  let ux = Math.cos(rads) * MOVE_SPEED;
  let uy = Math.sin(rads) * MOVE_SPEED;
  wizard.x += ux;
  wizard.y += uy;
  updateMaskPositionFromCenter(
    wizard.mask,
    wizard.x + MASK_OFFSET_X,
    wizard.y + MASK_OFFSET_Y,
    MASK_WIDTH / 2,
    MASK_HEIGHT / 2,
  );

  if (wizard.spellCooldown-- <= 0) {
    wizard.spellCooldown = SPELL_COOLDOWN;
    const spells = world.systems.get(Spells);
    let entity = spells.spawnSpell(world);
    entity.spell.x = wizard.x;
    entity.spell.y = wizard.y;
    entity.spell.dx = ux * SPELL_SPEED;
    entity.spell.dy = uy * SPELL_SPEED;
    entity.spell.spellType = Random.rangeInt(0, glyphPngParams.FRAME_COUNT);
  }

  let cx = CURSOR_X.current.value * world.display.width;
  let cy = CURSOR_Y.current.value * world.display.height;

  let [x1, y1, x2, y2] = wizard.mask;
  if (CLICK.current.value > 0 && cx >= x1 && cx <= x2 && cy >= y1 && cy <= y2) {
    // CLICKED!
    clickWizard(world, wizard);
  }
}

/**
 * @param {import('../index').World} world
 * @param {Wizard} wizard
 */
function renderWizard(world, wizard) {
  const { ctx, tia } = world;
  let w = wizardPngAsset.current;
  if (!w) {
    throw new Error('Missing wizard asset.');
  }
  drawSpriteUV(
    ctx,
    tia,
    w,
    wizard.x - FRAME_WIDTH / 2,
    wizard.y - FRAME_HEIGHT / 2,
    wizard.spriteIndex,
    FRAME_WIDTH,
    FRAME_HEIGHT,
    FRAME_COUNT,
  );
}

/**
 * @param {import('../index').World} world
 * @param {Wizard} wizard
 */
function clickWizard(world, wizard) {
  const particles = world.systems.get(Particles);
  let p = particles.spawnParticle(
    world,
    wizard.x,
    wizard.y,
    Random.range(14, 18),
    'ghost',
  );
  p.dy = Random.range(-1.4, -1.2);
  particles.spawnParticle(world, wizard.x, wizard.y, 8, 'splat');
  despawnWizard(world, wizard);
  const timer = world.systems.get(Timer);
  timer.count = Math.floor(timer.count) - 1;
}

/**
 * @param {import('../index').World} world
 * @param {Wizard} wizard
 */
function blowUpWizard(world, wizard) {
  const particles = world.systems.get(Particles);
  let p = particles.spawnParticle(
    world,
    wizard.x,
    wizard.y,
    Random.range(14, 18),
    'ghost',
  );
  p.dy = Random.range(-1.4, -1.2);
  particles.spawnParticle(world, wizard.x, wizard.y, 8, 'splat');
  despawnWizard(world, wizard);
}
