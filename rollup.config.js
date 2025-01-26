import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript'; // Für die JS-Bundles
import dts from 'rollup-plugin-dts';
import terser from '@rollup/plugin-terser';

export default defineConfig([{
  input: "src/index.ts",
  output: [
    {
      file: 'dist/feature-toggle.js',
      format: 'es',
    },
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json', // Verwende deine tsconfig.json
    }),
  ]
},{
  input: "src/index.ts",
  output: [
    {
      sourcemap:true,
      file: 'dist/feature-toggle.min.js',
      format: 'es',
    },
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json', // Verwende deine tsconfig.json
    }),
    terser()
  ]
},
{
  input: "src/index.ts",
  output: [
    {
      sourcemap: true,
      file: 'dist/feature-toggle.min.cjs',
      format: 'cjs'
    },
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.cjs.json'
    }),
    terser()
  ]
},{
  input: "src/featureToggle.ts",
  output: [
    {
      sourcemap: true,
      file: 'dist/feature-toggle.umd.min.js',
      format: 'umd',
      name: 'useFeatureToggle'
    },
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json'
    }),
    terser(),
  ]
},{
  input: "src/plugins/htmlplugin/plugin-html.ts",
  output: [
    {
      sourcemap: true,
      file: 'dist/html-plugin.umd.min.js',
      format: 'umd',
      name: 'featureToggleHtmlPlugin'
    },
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json'
    }),
    terser(),
  ]
},{
  input: "src/plugins/urlplugin/plugin-url.ts",
  output: [
    {
      sourcemap: true,
      file: 'dist/url-plugin.umd.min.js',
      format: 'umd',
      name: 'featureToggleURLPlugin'
    },
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json'
    }),
    terser(),
  ]
},{
  input: 'src/index.ts',
  output: {
    file: 'dist/feature-toggle.d.ts',
    format: 'es',
  },
  plugins: [
    dts(),
  ],
},]);