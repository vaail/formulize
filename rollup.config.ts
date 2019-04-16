import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import camelCase from 'lodash.camelcase';
import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';
import scss from 'rollup-plugin-scss';

const getRollupOptions = (_options = {}) => {
    const options = {
        ...{
            prefix: null,
            libraryName: 'formulize',
            input: 'src/formulize.ts',
            outputFile: 'dist/formulize.umd.js'
        },
        ..._options
    };
    return {
        input: options.input,
        output: [
            { file: options.outputFile, name: camelCase(options.libraryName), format: 'umd', sourcemap: true }
        ],
        external: [],
        watch: {
            include: 'src/**',
        },
        plugins: [
            scss({ output: `dist/${options.libraryName}.css` }),
            json(),
            typescript({
                tsconfigOverride: {
                    compilerOptions: {
                        module: 'es2015'
                    }
                },
                useTsconfigDeclarationDir: true
            }),
            commonjs(),
            resolve(),
            sourceMaps(),
        ]
    };
};

export default [
    getRollupOptions(),
    getRollupOptions({
        input: 'src/formulize.no_overrides.ts',
        outputFile: 'dist/formulize.no_overrides.umd.js'
    }),
];
