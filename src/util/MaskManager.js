import { vec2 } from 'gl-matrix';

import { ObjectPool } from './ObjectPool';

/** @typedef {ReturnType<createMask>} Mask */
/** @typedef {number} GroupFilterBits */

const MAX_GROUP_BITS = 32;

export class MaskManager {
  /**
   * @param {Array<string>} [initalGroups]
   */
  constructor(initialGroups = []) {
    this.objects = new ObjectPool(64, createMask);
    this.results = new ObjectPool(64, createResult);
    this.filters = new GroupFilters(initialGroups);
  }

  /**
   * @param {Array<string>} groups
   */
  create(groups = []) {
    let result = this.objects.obtain();
    result.filter = this.filters.compute(groups);
    return result;
  }

  /**
   * @param {Mask} mask
   */
  delete(mask) {
    this.objects.release(mask);
  }

  *test() {
    for (let obj of this.objects) {
      for (let other of this.objects) {
        if (obj === other) {
          continue;
        }
        if (!this.filters.overlaps(obj.filter, other.filter)) {
          continue;
        }
        if (!intersects(obj, other)) {
          continue;
        }
        // Found an intersection that matched filters!
        let result = this.results.obtain();
        result.mask = obj;
        result.other = other;
        yield result;
        this.results.release(result);
      }
    }
    this.results.clear();
  }
}

/**
 * @param {Mask} a
 * @param {Mask} b
 */
function intersects(a, b) {
  if (Math.abs(a.center[0] - b.center[0]) > a.radius[0] + b.radius[0])
    return false;
  if (Math.abs(a.center[1] - b.center[1]) > a.radius[1] + b.radius[1])
    return false;
  return true;
}

class GroupFilters {
  /**
   * @param {Array<string>} initialGroups
   */
  constructor(initialGroups = []) {
    this.indexedGroups = [...initialGroups];
  }

  /**
   * @param {Array<string>} groups
   * @returns {GroupFilterBits}
   */
  compute(groups) {
    if (groups.length === 0) {
      return 0;
    }
    let result = 0x0;
    for (let group of groups) {
      let i = this.indexedGroups.indexOf(group);
      if (i < 0) {
        i = this.indexedGroups.length;
        if (i >= MAX_GROUP_BITS) {
          throw new Error(
            `Cannot create group filter for '${group}' - out of group filter bits!`,
          );
        }
        // This is a new group.
        this.indexedGroups.push(group);
      }
      result |= 0x1 << i;
    }
    return result;
  }

  /**
   * @param {GroupFilterBits} a
   * @param {GroupFilterBits} b
   */
  overlaps(a, b) {
    return a & (b !== 0);
  }

  values() {
    return this.indexedGroups;
  }
}

/**
 * @param {Mask} mask
 * @param {number} x
 * @param {number} y
 * @param {number} halfWidth
 * @param {number} halfHeight
 */
export function setBoundingBox(mask, x, y, halfWidth, halfHeight) {
  let { center, radius } = mask;
  vec2.set(center, x, y);
  vec2.set(radius, halfWidth, halfHeight);
  return mask;
}

/**
 * @param {Mask} mask
 * @param {number} left
 * @param {number} top
 * @param {number} right
 * @param {number} bottom
 */
export function setBoundingRect(mask, left, top, right, bottom) {
  let { center, radius } = mask;
  let x = Math.min(left, right);
  let y = Math.min(top, bottom);
  let w = Math.abs(right - left);
  let h = Math.abs(bottom - top);
  vec2.set(center, x, y);
  vec2.set(radius, w / 2, h / 2);
  return mask;
}

function createMask() {
  return {
    center: vec2.create(),
    radius: vec2.create(),
    filter: 0,
  };
}

function createResult() {
  return {
    /** @type {Mask} */
    mask: null,
    /** @type {Mask} */
    other: null,
  };
}
