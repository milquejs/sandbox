import { AssetRef, ImageLoader } from '@milquejs/milque';

import FILEPATH from './nums.png';

export default new AssetRef(
  'nums.png',
  ImageLoader,
  {
    imageType: 'png',
    spriteWidth: 64,
    spriteHeight: 64,
    spriteCount: 16,
  },
  FILEPATH,
);
