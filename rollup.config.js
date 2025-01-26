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
  input: "src/index.ts",
  output: [
    {
      sourcemap: true,
      file: 'dist/feature-toggle.umd.min.js',
      format: 'umd',
      name: 'featureToggle'
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