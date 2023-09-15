import { AxisBinding, ButtonBinding, KeyCodes } from '@milquejs/milque';

/**
 * @template {Record<string, import('@milquejs/milque').InputBinding> & {
 *  click: import('@milquejs/milque').InputBinding,
 *  posX: import('@milquejs/milque').InputBinding,
 *  posY: import('@milquejs/milque').InputBinding,
 * }} Bindings
 */
export class Tio {
  static get DEFAULT_BINDINGS() {
    return {
      click: new ButtonBinding('tio.click', [
        KeyCodes.MOUSE_BUTTON_0,
        KeyCodes.MOUSE_BUTTON_2,
      ]),
      posX: new AxisBinding('tio.pos.x', KeyCodes.MOUSE_POS_X),
      posY: new AxisBinding('tio.pos.y', KeyCodes.MOUSE_POS_Y),
      up: new ButtonBinding('tio.up', [KeyCodes.KEY_W, KeyCodes.ARROW_UP]),
      left: new ButtonBinding('tio.left', [
        KeyCodes.KEY_A,
        KeyCodes.ARROW_LEFT,
      ]),
      down: new ButtonBinding('tio.down', [
        KeyCodes.KEY_S,
        KeyCodes.ARROW_DOWN,
      ]),
      right: new ButtonBinding('tio.right', [
        KeyCodes.KEY_D,
        KeyCodes.ARROW_RIGHT,
      ]),
      a: new ButtonBinding('tio.a', KeyCodes.KEY_Z),
      b: new ButtonBinding('tio.b', KeyCodes.KEY_X),
      space: new ButtonBinding('tio.space', KeyCodes.SPACE),
    };
  }

  /**
   * @param {Bindings} bindings
   */
  constructor(bindings) {
    /** @private */
    this.x = 0;
    /** @private */
    this.y = 0;
    /** @private */
    this.w = 1;
    /** @private */
    this.h = 1;

    this.bindings = bindings;

    // TODO: Support multiple players.
  }

  /**
   * @param {import('@milquejs/milque').InputContext} axb
   */
  bindKeys(axb) {
    // TODO: Is there a better way than binding?
    for(let binding of Object.values(this.bindings)) {
      binding.bindKeys(axb);
    }
  }

  /**
   * @param {import('@milquejs/milque').InputContext} axb
   */
  poll(axb) {
    axb.poll();
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */
  camera(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  /**
   * @param {import('@milquejs/milque').InputContext} axb
   * @param {number} [fromX]
   * @param {number} [fromY]
   * @param {number} [toX]
   * @param {number} [toY]
   */
  click(
    axb,
    fromX = Number.NEGATIVE_INFINITY,
    fromY = Number.NEGATIVE_INFINITY,
    toX = Number.POSITIVE_INFINITY,
    toY = Number.POSITIVE_INFINITY,
  ) {
    return axb.isButtonReleased(this.bindings.click.name) && this.hover(axb, fromX, fromY, toX, toY);
  }

  /**
   * @param {import('@milquejs/milque').InputContext} axb
   * @param {number} [fromX]
   * @param {number} [fromY]
   * @param {number} [toX]
   * @param {number} [toY]
   */
  hover(
    axb,
    fromX = Number.NEGATIVE_INFINITY,
    fromY = Number.NEGATIVE_INFINITY,
    toX = Number.POSITIVE_INFINITY,
    toY = Number.POSITIVE_INFINITY,
  ) {
    const x = this.posX(axb);
    const y = this.posY(axb);
    return x >= fromX && x <= toX && y >= fromY && y <= toY;
  }

  /** @param {import('@milquejs/milque').InputContext} axb */
  posX(axb) {
    return this.x + axb.getAxisValue(this.bindings.posX.name) * this.w;
  }

  /** @param {import('@milquejs/milque').InputContext} axb */
  posY(axb) {
    return this.y + axb.getAxisValue(this.bindings.posY.name) * this.h;
  }

  /**
   * @param {import('@milquejs/milque').InputContext} axb
   * @param {keyof Bindings} key
   */
  btn(axb, key) {
    return this.hold(axb, key);
  }

  /**
   * @param {import('@milquejs/milque').InputContext} axb
   * @param {keyof Bindings} key
   */
  press(axb, key) {
    return axb.isButtonPressed(this.bindings[key].name);
  }

  /**
   * @param {import('@milquejs/milque').InputContext} axb
   * @param {keyof Bindings} key
   */
  release(axb, key) {
    return axb.isButtonReleased(this.bindings[key].name);
  }

  /**
   * @param {import('@milquejs/milque').InputContext} axb
   * @param {keyof Bindings} key
   */
  hold(axb, key, minTime = 0) {
    return axb.isButtonDown(this.bindings[key].name);
  }

  /**
   * @param {import('@milquejs/milque').InputContext} axb
   * @param {keyof Bindings} key
   */
  value(axb, key) {
    return axb.getInputValue(this.bindings[key].name);
  }
}
