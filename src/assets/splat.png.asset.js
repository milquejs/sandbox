import { AssetRef, ImageLoader } from '@milquejs/milque';

import FILEPATH from './splat.png';

export default new AssetRef(
  'splat.png',
  ImageLoader,
  {
    imageType: 'png',
    spriteWidth: 80,
    spriteHeight: 80,
    spriteCount: 6,
  },
  FILEPATH,
);

export const FRAME_WIDTH = 80;
export const FRAME_HEIGHT = 80;
export const FRAME_COUNT = 6;
