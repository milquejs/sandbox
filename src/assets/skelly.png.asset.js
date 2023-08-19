import { AssetRef, ImageLoader } from '@milquejs/milque';

import FILEPATH from './skelly.png';

export default new AssetRef(
  'skelly.png',
  ImageLoader,
  {
    imageType: 'png',
    spriteWidth: 64,
    spriteHeight: 64,
    spriteCount: 3,
  },
  FILEPATH,
);
