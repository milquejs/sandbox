import { AssetRef, ImageLoader } from '@milquejs/milque';
import FILEPATH from './button.png';
export default (
  new AssetRef('button.png', ImageLoader, { imageType: 'png' }, FILEPATH)
);

export const FRAME_WIDTH = 256;
export const FRAME_HEIGHT = 128;
export const FRAME_COUNT = 4;
