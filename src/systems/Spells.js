import {
  Archetype,
  ComponentClass,
  Experimental,
  Random,
} from '@milquejs/milque';

import glyphPngAsset, * as glyphPngParams from '@/assets/glyph.png.asset';

import { CURSOR_X, CURSOR_Y, WORLD_RENDER, WORLD_UPDATE } from '..';
import { drawSpriteUV } from '../util/SpriteUV';
import { Masks, createMask, updateMaskPositionFromCenter } from './Masks';
import { Particles } from './Particles';
import { Timer, stringHash } from './Timer';

export const SpellComponent = new ComponentClass('spell', () => ({
  x: 0,
  y: 0,
  dx: 1,
  dy: 1,
  spellType: 0,
  mask: createMask(0, 0, 0, 0),
}));
export const SpellArchetype = new Archetype({ spell: SpellComponent });

/**
 * @param {import('..').World} world
 */
export function Spells(world) {
  WORLD_UPDATE.on(world.topics, 0, updateSpells);
  WORLD_RENDER.on(world.topics, 0, renderSpells);
  return {
    spawnSpell,
    despawnSpell,
  };
}

/**
 * @param {import('..').World} world
 */
function spawnSpell(world) {
  let result = SpellArchetype.create(world.ents);
  const masks = world.systems.get(Masks);
  masks.spawnMask(world, result.spell.mask);
  return result;
}

/**
 * @param {import('..').World} world
 * @param {import('@milquejs/milque').EntityId} entityId
 */
function despawnSpell(world, entityId) {
  let entity = SpellArchetype.find(world.ents, entityId);
  const masks = world.systems.get(Masks);
  masks.despawnMask(world, entity.spell.mask);
  SpellArchetype.destroy(world.ents, entityId);
}

/**
 * @param {import('..').World} world
 */
function updateSpells(world) {
  for (let entityId of SpellArchetype.findEntityIds(world.ents)) {
    let entity = SpellArchetype.find(world.ents, entityId);
    entity.spell.x += entity.spell.dx;
    entity.spell.y += entity.spell.dy;
    updateMaskPositionFromCenter(
      entity.spell.mask,
      entity.spell.x,
      entity.spell.y,
      glyphPngParams.FRAME_WIDTH / 2,
      glyphPngParams.FRAME_HEIGHT / 2,
    );

    let cx = CURSOR_X.current.value * world.display.width;
    let cy = CURSOR_Y.current.value * world.display.height;

    let [x1, y1, x2, y2] = entity.spell.mask;
    if (cx >= x1 && cx <= x2 && cy >= y1 && cy <= y2) {
      // HIT HAND!
      const timer = world.systems.get(Timer);
      timer.count += 1;
      const particles = world.systems.get(Particles);
      for (let i = 0; i < 20; ++i) {
        let p = particles.spawnParticle(
          world,
          cx,
          cy,
          Random.range(3, 10),
          'blood',
        );
        p.dx = Random.range(-5, 5);
        p.dy = Random.range(-5, 5);
      }
      world.ents.destroy(entityId);
      return;
    }

    if (entity.spell.x <= 0 || entity.spell.x >= world.display.width) {
      world.ents.destroy(entityId);
    } else if (entity.spell.y <= 0 || entity.spell.y >= world.display.height) {
      world.ents.destroy(entityId);
    }
  }
}

/**
 * @param {import('..').World} world
 */
function renderSpells(world) {
  const { ctx, tia } = world;
  for (let { spell } of SpellArchetype.findAll(world.ents)) {
    drawGlyph(ctx, tia, spell.x, spell.y, `${spell.spellType}`);
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Experimental.Tia} tia
 * @param {number} x
 * @param {number} y
 * @param {string} text
 */
export function drawGlyph(ctx, tia, x, y, text) {
  for (let dx = -text.length / 2; dx <= text.length / 2; ++dx) {
    let i = Math.abs(stringHash(text + 'fancy') % glyphPngParams.FRAME_COUNT);
    drawSpriteUV(
      ctx,
      tia,
      glyphPngAsset.current,
      x - glyphPngParams.FRAME_WIDTH / 2 + dx * glyphPngParams.FRAME_WIDTH,
      y - glyphPngParams.FRAME_HEIGHT / 2,
      i,
      glyphPngParams.FRAME_WIDTH,
      glyphPngParams.FRAME_HEIGHT,
      glyphPngParams.FRAME_COUNT,
    );
  }
}
