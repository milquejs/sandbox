/**
 * @typedef {number} NodeId
 */

export class NodeTree {
  /** @type {Array<NodeId>} */
  roots = [];
  /** @type {Record<NodeId, NodeId>} */
  parents = {};
  /** @type {Record<NodeId, Array<NodeId>>} */
  children = {};

  clone() {
    let result = new NodeTree();
    result.roots = this.roots.slice();
    result.parents = {
      ...this.parents,
    };
    result.children = Object.fromEntries(
      Object.entries(this.children).map(([k, v]) => [k, v.slice()]),
    );
    return result;
  }

  clear() {
    this.roots = [];
    this.parents = {};
    this.children = {};
  }

  /**
   * @param {NodeId} node
   */
  parentOf(node) {
    return this.parents[node];
  }

  /**
   * @param {NodeId} node
   * @param {number} [childIndex]
   */
  childOf(node, childIndex = 0) {
    return this.children[node].at(childIndex);
  }

  /**
   * @param {NodeId} node
   */
  childrenOf(node) {
    return this.children[node];
  }

  /**
   * @param {NodeId} node
   */
  isRoot(node) {
    return node in this.roots;
  }

  /**
   * @param {NodeId} node
   */
  has(node) {
    return node in this.parents;
  }

  /**
   * @param {NodeId} node
   * @param {NodeId} parentNode
   */
  add(node, parentNode = 0) {
    attach(this, node, parentNode);
  }

  /**
   * Remove self and all related children.
   *
   * @param {NodeId} node
   */
  remove(node) {
    let parent = this.parents[node];
    detach(this, node, parent);
    for (let n of simpleDFS(this, node)) {
      delete this.parents[n];
      delete this.children[n];
    }
  }

  /**
   * @param {NodeId} childNode
   * @param {NodeId} parentNode
   */
  reparent(childNode, parentNode) {
    detach(this, childNode, this.parents[childNode]);
    attach(this, childNode, parentNode);
  }

  /**
   * @param {NodeId} parentNode
   * @param {(a: number, b: number) => number} compareFn
   */
  reorder(parentNode, compareFn) {
    this.children[parentNode].sort(compareFn);
  }

  /**
   * @param {NodeId} parentNode
   * @param {NodeId} childNode
   */
  reorderToFirst(parentNode, childNode) {
    let children = this.children[parentNode];
    let i = children.indexOf(childNode);
    children.splice(i, 1);
    children.unshift(childNode);
  }

  /**
   * @param {NodeId} parentNode
   * @param {NodeId} childNode
   */
  reorderToLast(parentNode, childNode) {
    let children = this.children[parentNode];
    let i = children.indexOf(childNode);
    children.splice(i, 1);
    children.push(childNode);
  }

  /**
   * Remove all children after parentNode.
   *
   * @param {NodeId} parentNode
   */
  prune(parentNode) {
    if (!(parentNode in this.parents)) {
      throw new Error('Cannot delete non-parent node from graph.');
    }
    for (let child of this.children[parentNode]) {
      detach(this, child, parentNode);
      for (let node of simpleDFS(this, child)) {
        delete this.parents[node];
        delete this.children[node];
      }
    }
  }

  /**
   * Replaces the targetNode position with the replacementNode in
   * the node graph. All children are maintained. If replacement
   * node is 0, then it will splice, reattaching its children to
   * its parent (removing the middle targetNode).
   *
   * @param {NodeId} targetNode
   * @param {NodeId} replacementNode
   */
  replace(targetNode, replacementNode) {
    let parentNode = this.parents[targetNode];
    let grandChildren = this.children[parentNode]?.slice() || [];

    // Remove the target node from graph
    detach(this, targetNode, parentNode);

    // Begin grafting the grandchildren by removing them...
    delete this.children[targetNode];

    if (replacementNode) {
      // Reattach all grandchildren to new replacement node.
      let replacementParentId = this.parents[replacementNode];
      let replacementChildren =
        this.children[replacementNode] || (this.children[replacementNode] = []);

      // Remove replacement node from previous parent
      detach(this, replacementNode, replacementParentId);

      // ...and graft them back.
      replacementChildren.push(...grandChildren);

      // And reattach target parent to new child.
      attach(this, replacementNode, parentNode);
    } else {
      // Reattach all grandchildren to target parent...
      if (parentNode) {
        //...as regular children.
        let parentChildren =
          this.children[parentNode] || (this.children[parentNode] = []);
        parentChildren.push(...grandChildren);
      } else {
        //...as root children.
        this.roots.push(...grandChildren);
      }
    }

    // ...and repair their parent relations.
    for (let childNode of grandChildren) {
      this.parents[childNode] = parentNode;
    }
  }

  /**
   * @param {NodeId} [fromNode]
   * @returns {Generator<[node: NodeId, level: number]>}
   */
  *walk(fromNode = 0) {
    if (fromNode === 0) {
      for (let rootNode of this.roots) {
        yield* stackDFS(this, rootNode);
      }
    } else {
      yield* stackDFS(this, fromNode);
    }
  }
}

/**
 * Attaches a child node to a parent in the node graph.
 * If no parentNode, then it will attach as a root node.
 *
 * @param {NodeTree} out The node graph to attach in.
 * @param {number} childNode The child node to attach from.
 * @param {number} parentNode The parent node to attach to. Can be 0 for null.
 */
function attach(out, childNode, parentNode) {
  if (parentNode) {
    // Has new parent; attach to parent. It is now in the graph.
    let prev = out.children[parentNode];
    if (prev) {
      prev.push(childNode);
    } else {
      out.children[parentNode] = [childNode];
    }
    out.parents[childNode] = parentNode;
  } else {
    // No parent; move to root. It is now in the graph.
    out.roots.push(childNode);
    out.parents[childNode] = 0;
  }
}

/**
 * Detaches a child node from its parent in the node graph.
 * If has no parentNode, then it will detach as a root node.
 *
 * @param {NodeTree} out The node graph to attach in.
 * @param {number} childNode The child node to detach.
 * @param {number} parentNode The parent node attached to. Could be 0 for none.
 */
function detach(out, childNode, parentNode) {
  if (parentNode) {
    // Has parent; detach from parent. It is now a free node.
    let children = out.children[parentNode];
    let childIndex = children.indexOf(childNode);
    children.splice(childIndex, 1);
  } else {
    // No parent; remove from root. It is now a free node.
    let roots = out.roots;
    let rootIndex = roots.indexOf(childNode);
    roots.splice(rootIndex, 1);
  }
  out.parents[childNode] = 0;
}

/**
 * @param {NodeTree} graph
 * @param {NodeId} from
 */
function* simpleDFS(graph, from) {
  let curr = 0;
  let next = [from];
  while (next.length > 0) {
    // @ts-ignore
    curr = next.pop();
    let children = graph.children[curr];
    if (children) {
      // Order matters! This will visit children at index 0 first.
      for (let i = children.length - 1; i >= 0; --i) {
        next.push(children[i]);
      }
    }
    yield curr;
  }
}

/**
 * @param {NodeTree} graph
 * @param {NodeId} from
 */
function* stackDFS(graph, from) {
  let level = 0;
  let curr = 0;
  /** @type {[node: NodeId, level: number]} */
  let out = [curr, level];
  let prevParent = 0;
  let next = [from];
  while (next.length > 0) {
    // @ts-ignore
    curr = next.pop();
    let currLevel = level;
    let currParent = graph.parents[curr];
    let children = graph.children[curr];
    if (children) {
      ++level;
      // Order matters! This will visit children at index 0 first.
      for (let i = children.length - 1; i >= 0; --i) {
        next.push(children[i]);
      }
    } else if (prevParent !== currParent) {
      // No more children. It's a different parent.
      --level;
      prevParent = currParent;
    } else {
      // It's the same parent at the same level.
    }
    out[0] = curr;
    out[1] = currLevel;
    yield out;
  }
}
