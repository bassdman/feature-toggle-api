const { series, src, dest } = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const rollup = require('gulp-rollup');

function build_module() {
    return src('src/index.js')
        //      .pipe(sourcemaps.init())
        .pipe(rollup({
            // any option supported by Rollup can be set here.
            input: './src/index.js',
            output: {
                format: 'cjs'
            }
        }))
        .pipe(babel({
            presets: ["@babel/preset-env"]
        }))
        .pipe(concat('feature-toggle-api.module.js'))
        //     .pipe(sourcemaps.write())
        .pipe(dest('./'));
};

function build_raw() {
    return src('src/*.js')
        //      .pipe(sourcemaps.init())
        .pipe(rollup({
            // any option supported by Rollup can be set here.
            input: './src/index.cjs.js',
            output: {
                format: 'cjs'
            }
        }))
        .pipe(babel({
            presets: ["@babel/preset-env"]
        }))
        .pipe(concat('feature-toggle-api.js'))
        //     .pipe(sourcemaps.write())
        .pipe(dest('./'));
};

function build_min() {
    return src('src/*.js')
        //   .pipe(sourcemaps.init())
        .pipe(rollup({
            // any option supported by Rollup can be set here.
            input: './src/index.cjs.js',
            output: {
                format: 'cjs'
            }
        }))
        .pipe(babel({
            presets: ["@babel/preset-env"]
        }))
        .pipe(uglify())
        .pipe(concat('feature-toggle-api.min.js'))
        //    .pipe(sourcemaps.write())
        .pipe(dest('./'));
};

function build_plugins() {
    return src(['src/plugins/htmlplugin/plugin-html.js', 'src/plugins/urlplugin/plugin-url.js'])
        //   .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ["@babel/preset-env"]
        }))
        .pipe(uglify())
        //.pipe(concat('feature-toggle-api.min.js'))
        //    .pipe(sourcemaps.write())
        .pipe(dest('./'));
};

exports.build = series(build_raw, build_min, build_plugins, build_module);