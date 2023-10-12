import { AssetRef, ImageLoader } from '@milquejs/milque';

import FILEPATH from './logo.png';

export default new AssetRef(
  'logo.png',
  ImageLoader,
  {
    imageType: 'png',
    spriteWidth: 512,
    spriteHeight: 512,
    spriteCount: 2,
  },
  FILEPATH,
);
