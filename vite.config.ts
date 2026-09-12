import { resolve } from 'node:path';
import { defineConfig, type UserConfig } from 'vite';
import dts from 'vite-plugin-dts';

const root = resolve(import.meta.dirname, 'src');

type BuildMode = 'esm' | 'html-esm' | 'url-esm';

const builds: Record<BuildMode, {
    entry: string;
    fileName: string;
    name?: string;
    withTypes?: boolean;
}> = {
    esm: {
        entry: 'index.ts',
        fileName: 'feature-toggle.js',
        withTypes: true,
    },
    'html-esm': {
        entry: 'plugins/htmlplugin/plugin-html.ts',
        fileName: 'html-plugin.js',
    },
    'url-esm': {
        entry: 'plugins/urlplugin/plugin-url.ts',
        fileName: 'url-plugin.js',
    },
};

export default defineConfig(({ mode }): UserConfig => {
    const buildMode = mode as BuildMode;
    const build = builds[buildMode];

    if (!build) {
        throw new Error(`Unknown build mode: ${mode}`);
    }

    return {
        build: {
            emptyOutDir: buildMode === 'esm',
            lib: {
                entry: resolve(root, build.entry),
                formats: ['es'],
                fileName: () => build.fileName,
            },
            sourcemap: true,
            rollupOptions: {
                output: {
                    exports: 'named',
                },
            },
        },
        plugins: build.withTypes
            ? [dts({ entryRoot: root, outDirs: 'dist' })]
            : [],
    };
});
