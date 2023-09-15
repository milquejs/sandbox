import { AssetRef, ImageLoader } from '@milquejs/milque';

import FILEPATH from './dirt.png';

export default new AssetRef(
  'dirt.png',
  ImageLoader,
  {
    imageType: 'png',
    spriteWidth: 64,
    spriteHeight: 64,
    spriteCount: 3,
  },
  FILEPATH,
);
