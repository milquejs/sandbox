import fs from 'fs/promises';
import path from 'path';
import { toPascalCase } from './src/util/CamelCase.js';

/**
 * @typedef SprData
 * @property {string} src
 * @property {string} loader
 * @property {object} opts
 */

/**
 * @returns {import('esbuild').Plugin}
 */
export default function SPRLoaderPlugin() {
  return {
    name: 'spr',
    /** @param {import('esbuild').PluginBuild} build */
    setup(build) {
      build.onLoad({ filter: /\.spr$/ }, async args => {
        const fileName = path.basename(args.path, '.spr');
        const text = await fs.readFile(args.path, 'utf8');
        const json = JSON.parse(text);

        const { src, loader, opts = {} } = json;
        const uri = src;
        let loaderClass;
        switch(loader) {
          case 'image':
            loaderClass = 'ImageLoader';
            break;
          default:
            throw new Error('Unknown loader.');
        }
        const className = toPascalCase(fileName);
        
        let contents = `
          import { AssetRef, ${loaderClass} } from '@milquejs/milque';
          import FILEPATH from '${src}';
          export default new AssetRef('${uri}', ImageLoader, ${JSON.stringify(opts)}, FILEPATH);
        `;

        return { contents, loader: 'js' };
      });
    }
  };
}
