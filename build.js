import fs from 'fs/promises';
import path from 'path';
import * as esbuild from 'esbuild';
import open from 'open';

const OUT_DIR = path.resolve('./dist');
const SERVE_DIR = path.resolve('./build');
const ENTRY_POINTS = [
  './src/index.js',
];

async function main(args) {
  if (args.includes('--dev')) {
    await dev();
  } else {
    await build();
  }
}

main(process.argv);

async function dev() {
  const isProduction = false;

  // Clear output directory...
  await fs.rm(SERVE_DIR, { force: true, recursive: true });
  // Copy index.html
  await fs.cp(path.join(path.dirname(ENTRY_POINTS[0]), 'index.html'), path.join(SERVE_DIR, '/index.html'));

  // Serve it.
  /** @type {esbuild.BuildOptions} */
  const opts = {
    entryPoints: ENTRY_POINTS,
    outdir: SERVE_DIR,
    bundle: true,
    sourcemap: true,
    define: {
        'window.IS_PRODUCTION': String(Boolean(isProduction)),
        'process.platform': JSON.stringify('browser'),
    },
  };
  let ctx = await esbuild.context(opts);
  await ctx.watch();
  let server = await ctx.serve({ servedir: SERVE_DIR });
  const url = `http://${server.host}:${server.port}`;
  console.log(`Hosted server at ${url} ...`);
  await open(url, { wait: true });
  console.log('...closing server.');
  return;
}

async function build() {
  const isProduction = true;

  // Clear output directory...
  await fs.rm(OUT_DIR, { force: true, recursive: true });
  // Copy index.html
  await fs.cp(path.join(path.dirname(ENTRY_POINTS[0]), '/index.html'), path.join(OUT_DIR, '/index.html'));

  // Build it.
  /** @type {esbuild.BuildOptions} */
  const opts = {
    entryPoints: ENTRY_POINTS,
    outdir: OUT_DIR,
    bundle: true,
    minify: true,
    sourcemap: true,
    define: {
        'window.IS_PRODUCTION': String(Boolean(isProduction)),
        'process.platform': JSON.stringify('browser'),
    },
  };
  await esbuild.build(opts);
}
