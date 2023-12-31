import { AssetRef, ImageLoader } from '@milquejs/milque';

import FILEPATH from './tap_button.png';

export default new AssetRef(
  'tap_button.png',
  ImageLoader,
  {
    imageType: 'png',
    spriteWidth: 128,
    spriteHeight: 128,
    spriteCount: 4,
  },
  FILEPATH,
);

export const FRAME_WIDTH = 128;
export const FRAME_HEIGHT = 128;
export const FRAME_COUNT = 4;
