import { AssetRef, ImageLoader } from '@milquejs/milque';

import FILEPATH from './ghost.png';

export default new AssetRef(
  'ghost.png',
  ImageLoader,
  { imageType: 'png' },
  FILEPATH,
);

export const FRAME_WIDTH = 32;
export const FRAME_HEIGHT = 80;
export const FRAME_COUNT = 12;
