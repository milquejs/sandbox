import { AssetRef, ImageLoader } from '@milquejs/milque';

import FILEPATH from './splash_parts.png';

export default new AssetRef(
  'splash_parts.png',
  ImageLoader,
  {
    imageType: 'png',
    spriteWidth: 256,
    spriteHeight: 256,
    spriteCount: 11,
  },
  FILEPATH,
);
