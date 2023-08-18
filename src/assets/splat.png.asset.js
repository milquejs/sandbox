import { AssetRef, ImageLoader } from '@milquejs/milque';

import FILEPATH from './splat.png';

export default new AssetRef(
  'splat.png',
  ImageLoader,
  { imageType: 'png' },
  FILEPATH,
);

export const FRAME_WIDTH = 80;
export const FRAME_HEIGHT = 80;
export const FRAME_COUNT = 6;
