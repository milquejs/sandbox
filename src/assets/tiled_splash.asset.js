import { AssetRef, ImageLoader } from '@milquejs/milque';

import FILEPATH from './tiled_splash.png';

export default new AssetRef(
  'tiled_splash.png',
  ImageLoader,
  {
    imageType: 'png',
    spriteWidth: 512,
    spriteHeight: 512,
    spriteCount: 1,
  },
  FILEPATH,
);
