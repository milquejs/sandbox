import { AssetRef, ImageLoader } from '@milquejs/milque';
import FILEPATH from './wizard.png';
export default (
  new AssetRef('wizard.png', ImageLoader, { imageType: 'png' }, FILEPATH)
);

export const FRAME_WIDTH = 64;
export const FRAME_HEIGHT = 64;
export const FRAME_COUNT = 3;
