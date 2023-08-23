import { AssetRef, ImageLoader } from '@milquejs/milque';

import FILEPATH from './sheep.png';

export default new AssetRef(
  'sheep.png',
  ImageLoader,
  {
    imageType: 'png',
    spriteWidth: 128,
    spriteHeight: 128,
    spriteCount: 1,
  },
  FILEPATH,
);
