import { AssetRef, ImageLoader } from '@milquejs/milque';

import FILEPATH from './button.png';

export default new AssetRef(
  'button.png',
  ImageLoader,
  {
    imageType: 'png',
    spriteWidth: 256,
    spriteHeight: 128,
    spriteCount: 4,
  },
  FILEPATH,
);
