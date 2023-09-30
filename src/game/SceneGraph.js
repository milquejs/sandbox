import { ComponentFactory } from '@milquejs/milque';

import { NodeTree } from '../util/NodeTree';
import { Transform } from '../util/Transform';

export class SceneGraph {
  tree = new NodeTree();
  nextAvailableNodeId = 1;

  /** @type {Record<number, any>} */
  nodes = {};

  create() {
    return this.nextAvailableNodeId++;
  }

  /**
   * @param {import('../util/NodeTree').NodeId} parentId
   * @param {any} node
   */
  add(parentId, node) {
    let otherId = this.create();
    this.nodes[otherId] = node;
    this.tree.add(parentId, otherId);
  }
}

export class Group {}

class Node {
  transform = new Transform();
}

class Renderer {}

export const Renderable = new ComponentFactory('Renderable', () => ({
  nodeId: 0,
  renderType: 'none',
}));
