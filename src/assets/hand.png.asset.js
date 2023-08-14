import { AssetRef, ImageLoader } from '@milquejs/milque';
import FILEPATH from './hand.png';
export default (
  new AssetRef('hand.png', ImageLoader, { imageType: 'png' }, FILEPATH)
);

export const FRAME_WIDTH = 512;
export const FRAME_HEIGHT = 512;
export const FRAME_COUNT = 3;
