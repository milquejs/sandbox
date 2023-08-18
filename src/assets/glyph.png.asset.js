import { AssetRef, ImageLoader } from '@milquejs/milque';

import FILEPATH from './glyph.png';

export default new AssetRef(
  'glyph.png',
  ImageLoader,
  { imageType: 'png' },
  FILEPATH,
);

export const FRAME_WIDTH = 48;
export const FRAME_HEIGHT = 48;
export const FRAME_COUNT = 10;
