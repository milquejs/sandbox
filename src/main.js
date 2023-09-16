import { AnimationFrameLoop, Archetype, AsyncTopic, AxisBinding, ButtonBinding, ComponentClass, EntityManager, Experimental, FlexCanvas, InputContext, KeyCodes, Topic, TopicManager, lerp, screenToWorldRay } from '@milquejs/milque';

FlexCanvas.define();

export async function main() {
  const world = new World();
  await world.init();

  ChessBoard(world);
  CameraView(world);
  Cursor(world);
  ChessPiece(world);
}

const CameraComponent = new ComponentClass('camera', () => ({
  targetX: 0,
  targetY: 0,
  viewX: 0,
  viewY: 0,
}));
const CameraArchetype = new Archetype({ camera: CameraComponent });

const CameraControlX = new AxisBinding('camera.x', [KeyCodes.MOUSE_WHEEL_X]);
const CameraControlY = new AxisBinding('camera.Y', [KeyCodes.MOUSE_WHEEL_Y]);

/** @type {Topic<World>} */
const WorldViewRender = new Topic('world.viewrender');

/**
 * @param {World} w 
 */
function CameraView(w) {
  CameraArchetype.create(w.ents);
  CameraControlX.bindKeys(w.axb);
  CameraControlY.bindKeys(w.axb);
  
  WorldUpdate.on(w.topics, 0, w => {
    let dx = CameraControlX.get(w.axb).delta;
    let dy = CameraControlY.get(w.axb).delta;
    for(let entity of CameraArchetype.findAll(w.ents)) {
      entity.camera.targetX += dx;
      entity.camera.targetY += dy;
      entity.camera.viewX = lerp(entity.camera.viewX, entity.camera.targetX, w.dt);
      entity.camera.viewY = lerp(entity.camera.viewY, entity.camera.targetY, w.dt);
    }
  });

  WorldRender.on(w.topics, 0, w => {
    const e = CameraArchetype.findAny(w.ents);
    w.tia.push();
    w.tia.matPos(-e.camera.viewX, -e.camera.viewY);
    WorldViewRender.dispatchImmediately(w.topics, w);
    w.tia.pop();
  });
}

const CELL_WIDTH = 64;
const CELL_HEIGHT = 64;

const CursorClick = new ButtonBinding('cursor.click', [KeyCodes.MOUSE_BUTTON_0]);
const CursorX = new AxisBinding('cursor.x', [KeyCodes.MOUSE_POS_X]);
const CursorY = new AxisBinding('cursor.y', [KeyCodes.MOUSE_POS_Y]);

/**
 * @type {Topic<{ x: number, y: number }>}
 */
const CursorClickTopic = new Topic('cursor.click');

/**
 * @param {World} world 
 */
function Cursor(world) {
  CursorX.bindKeys(world.axb);
  CursorY.bindKeys(world.axb);

  WorldUpdate.on(world.topics, 0, w => {
    if (CursorClick.get(w.axb).pressed) {
      CursorClickTopic.dispatch(w.topics, {
        x: 0,
        y: 0,
      });
    }
  });

  WorldRender.on(world.topics, 0, w => {
    const camera = CameraArchetype.findAny(w.ents);
    let cx = CursorX.get(w.axb).value * w.canvas.width;
    let cy = CursorY.get(w.axb).value * w.canvas.height;
    let vx = -camera.camera.viewX;
    let vy = -camera.camera.viewY;
    let wx = cx - vx;
    let wy = cy - vy;
    let dx = Math.floor(wx / CELL_WIDTH) * CELL_WIDTH + vx;
    let dy = Math.floor(wy / CELL_HEIGHT) * CELL_HEIGHT + vy;
    w.tia.push();
    w.tia.matPos(dx, dy);
    renderCursor(w.tia, w.ctx);
    w.tia.pop();
  });
}

/**
 * @param {Experimental.Tia} tia 
 * @param {CanvasRenderingContext2D} ctx
 */
function renderCursor(tia, ctx) {
  tia.rectFill(ctx, 0, 0, 64, 64, 0xFF0000);
}

const ChessPieceComponent = new ComponentClass('chesspice', () => ({
  x: 0,
  y: 0,
  type: 'pawn',
}));
const ChessPieceArchetype = new Archetype({ chessPiece: ChessPieceComponent });

/**
 * @param {World} world 
 */
function ChessPiece(world) {
  let e = ChessPieceArchetype.create(world.ents);

  WorldViewRender.on(world.topics, 0, w => {
    for (let e of ChessPieceArchetype.findAll(w.ents)) {
      renderChessPiece(w.tia, w.ctx, e.chessPiece.type);
    }
  });
}

/**
 * @param {Experimental.Tia} tia 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string} type
 */
function renderChessPiece(tia, ctx, type) {
  switch(type) {
    case 'pawn':
      tia.rectFill(ctx, 16, 16, 48, 48, 0xFF00FF);
      break;
    default:
      break;
  }
}

/**
 * @param {World} world 
 */
function ChessBoard(world) {
  WorldRender.on(world.topics, 0, w => {
    const camera = CameraArchetype.findAny(w.ents);
    renderChessBoard(w.tia, w.ctx, -camera.camera.viewX, -camera.camera.viewY);
  });
}

/**
 * @param {Experimental.Tia} tia 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} offsetX 
 * @param {number} offsetY 
 */
function renderChessBoard(tia, ctx, offsetX, offsetY) {
  let screenWidth = ctx.canvas.width;
  let screenHeight = ctx.canvas.height;
  let cellWidth = 64;
  let cellHeight = 64;
  let numOfColumns = screenWidth / cellWidth;
  let numOfRows = screenHeight / cellHeight;
  let cellOffsetX = offsetX % cellWidth;
  let cellOffsetY = offsetY % cellHeight;
  let isOffsetXEven = Math.abs(Math.trunc(offsetX / cellWidth)) % 2 === 0;
  let isOffsetYEven = Math.abs(Math.trunc(offsetY / cellHeight)) % 2 === 0;
  tia.push();
  tia.matPos(cellOffsetX, cellOffsetY);
  const maxY = numOfRows + 1;
  const minY = -1;
  const maxX = numOfColumns + 2;
  const color = 0xFFFFFF;
  for(let y = minY; y < maxY; ++y) {
    let startX = y % 2 === 0 ? 0 : -1;
    if (isOffsetYEven !== isOffsetXEven) {
      startX = y % 2 === 0 ? -1 : 0;
    }
    for(let x = startX; x < maxX; x += 2) {
      tia.rectFill(ctx, x * cellWidth, y * cellHeight, (x + 1) * cellWidth, (y + 1) * cellHeight, color);
    }
  }
  tia.pop();
}


/** @type {AsyncTopic<World>} */
export const WorldLoad = new AsyncTopic('world.load');
/** @type {Topic<World>} */
export const WorldUpdate = new Topic('world.update');
/** @type {Topic<World>} */
export const WorldRender = new Topic('world.render');

export class World {
  canvas = new FlexCanvas({
    root: document.body,
    width: 600,
    height: 400,
    aspectRatio: 600 / 400
  });
  ctx = this.canvas.getContext('2d');
  tia = new Experimental.Tia();
  topics = new TopicManager();
  frame = /** @type { import('@milquejs/milque').AnimationFrameDetail } */ ({});
  dt = 0;
  loop = new AnimationFrameLoop(loop => {
    this.frame = loop.detail;
    this.dt = loop.detail.deltaTime / 60;
    this.axb.poll(loop.detail.currentTime);
    this.ents.flush();
    WorldUpdate.dispatchImmediately(this.topics, this);

    this.tia.cls(this.ctx);
    WorldRender.dispatchImmediately(this.topics, this);
  });
  ents = new EntityManager();
  axb = new InputContext(this.canvas);

  async init() {
    await WorldLoad.dispatchImmediately(this.topics, this);
    this.loop.start();
  }
}
