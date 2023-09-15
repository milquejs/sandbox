export const AIR = new Block(0, 'air');
export const STONE = new Block(1, 'stone');
export const GOLD = new Block(2, 'gold');

export class Block {
  /**
   * @param {number} blockId 
   * @param {string} blockName 
   */
  constructor(blockId, blockName) {
    this.blockId = blockId;
    this.blockName = blockName;
  }
}
