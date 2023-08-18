import { ComponentClass, Query } from '@milquejs/milque';
import { WORLD_RENDER, WORLD_UPDATE } from '..';
import { drawSpriteUV } from '../util/SpriteUV';
import ghostPngAsset, * as ghostPngParams from '@/assets/ghost.png.asset';
import splatPngAsset, * as splatPngParams from '@/assets/splat.png.asset';

const ParticleClass = new ComponentClass('particle', () => ({
  entityId: 0,
  x: 0,
  y: 0,
  dx: 0,
  dy: 0,
  energy: 0,
  initial: 0,
  renderType: '',
  /** @type {object|null} */
  renderParams: null,
}));

const ParticleQuery = new Query(ParticleClass);

/**
 * @param {import('..').World} world
 */
export function Particles(world) {
  WORLD_UPDATE.on(world.topics, 0, updateParticles);
  WORLD_RENDER.on(world.topics, 0, renderParticles);
  return {
    spawnParticle,
    despawnParticle,
  };
}

/**
 * @param {import('..').World} world
 * @param {number} x 
 * @param {number} y 
 * @param {number} energy
 * @param {string} renderType
 * @param {object|null} [renderParams]
 */
function spawnParticle(world, x, y, energy, renderType, renderParams = null) {
  const { ents } = world;
  let entityId = ents.create();
  let particle = ents.attach(entityId, ParticleClass);
  particle.entityId = entityId;
  particle.x = x;
  particle.y = y;
  particle.energy = energy;
  particle.initial = energy;
  particle.renderType = renderType;
  particle.renderParams = renderParams;
  return particle;
}

/**
 * @param {import('..').World} world 
 * @param {ReturnType<spawnParticle>} particle 
 */
function despawnParticle(world, particle) {
  const { ents } = world;
  ents.destroy(particle.entityId);
}

/**
 * @param {import('..').World} world 
 */
function updateParticles(world) {
  const { ents } = world;
  let dt = world.frame.deltaTime / 60;
  for(let particle of ParticleQuery.findComponents(ents, ParticleClass)) {
    particle.x += particle.dx;
    particle.y += particle.dy;
    particle.energy -= dt;
    if (particle.energy < 0) {
      ents.destroy(particle.entityId);
    }
  }
}

/**
 * @param {import('..').World} world 
 */
function renderParticles(world) {
  const { ents } = world;
  for(let particle of ParticleQuery.findComponents(ents, ParticleClass)) {
    renderParticle(world, particle);
  }
}

/**
 * @param {import('..').World} world 
 * @param {ReturnType<spawnParticle>} particle
 */
function renderParticle(world, particle) {
  const { ctx, tia } = world;
  let energyRatio = particle.energy / particle.initial;
  switch(particle.renderType) {
    case 'ghost':
      drawSpriteUV(ctx, tia, ghostPngAsset.current,
        particle.x - ghostPngParams.FRAME_WIDTH / 2,
        particle.y - ghostPngParams.FRAME_HEIGHT / 2,
        Math.floor((1 - energyRatio) * ghostPngParams.FRAME_COUNT),
        ghostPngParams.FRAME_WIDTH, ghostPngParams.FRAME_HEIGHT, ghostPngParams.FRAME_COUNT)
      break;
    case 'splat':
      drawSpriteUV(ctx, tia, splatPngAsset.current,
        particle.x - splatPngParams.FRAME_WIDTH / 2,
        particle.y - splatPngParams.FRAME_HEIGHT / 2,
        Math.floor((1 - energyRatio) * splatPngParams.FRAME_COUNT),
        splatPngParams.FRAME_WIDTH, splatPngParams.FRAME_HEIGHT, splatPngParams.FRAME_COUNT)
      break;
    case 'blood':
      tia.rectFill(ctx, particle.x, particle.y, particle.x + 10 * energyRatio, particle.y + 10 * energyRatio, 0xFF0000);
      break;
    default:
      tia.rectFill(ctx, particle.x, particle.y, particle.x + 1, particle.y + 1, 0xFF00FF);
  }
}