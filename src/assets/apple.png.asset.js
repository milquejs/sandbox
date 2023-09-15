import { AssetRef, ImageLoader } from '@milquejs/milque';

import FILEPATH from './apple.png';

export default new AssetRef(
  'apple.png',
  ImageLoader,
  {
    imageType: 'png',
    spriteWidth: 32,
    spriteHeight: 32,
    spriteCount: 1,
  },
  FILEPATH,
);
