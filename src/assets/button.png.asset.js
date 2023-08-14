import { AssetRef, ImageLoader } from '@milquejs/milque';
import FILEPATH from './button.png';
export default (
  new AssetRef('button.png', ImageLoader, { imageType: 'png' }, FILEPATH)
);
