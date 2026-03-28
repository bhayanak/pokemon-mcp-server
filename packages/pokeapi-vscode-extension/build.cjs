const esbuild = require('esbuild');
const path = require('path');

const serverEntry = path.resolve(__dirname, '..', 'pokeapi-server', 'src', 'index.ts');

Promise.all([
  // Extension entry point
  esbuild.build({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    outfile: 'dist/extension.js',
    external: ['vscode'],
    format: 'cjs',
    platform: 'node',
    target: 'node18',
    sourcemap: true,
    minify: false,
  }),
  // Server entry point — fully self-contained
  esbuild.build({
    entryPoints: [serverEntry],
    bundle: true,
    outfile: 'dist/server.js',
    format: 'cjs',
    platform: 'node',
    target: 'node18',
    sourcemap: true,
    minify: false,
    banner: {
      js: '#!/usr/bin/env node',
    },
  }),
])
  .then(() => console.log('Extension built successfully (extension.js + server.js)'))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
