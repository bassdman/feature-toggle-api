const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const rollup = require('gulp-rollup');

gulp.task('build_module', function(){
    return gulp.src('src/index.js')
  //      .pipe(sourcemaps.init())
        .pipe(rollup({
            // any option supported by Rollup can be set here.
            input: './src/index.js',
            output: {
                format: 'cjs'
            }
        }))
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(concat('feature-toggle-api.module.js'))
   //     .pipe(sourcemaps.write())
        .pipe(gulp.dest(''));
})

gulp.task('build_raw', function(){
    return gulp.src('src/*.js')
  //      .pipe(sourcemaps.init())
        .pipe(rollup({
            // any option supported by Rollup can be set here.
            input: './src/index.commonjs.js',
            output:{
                format: 'cjs'
            }
        }))
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(concat('feature-toggle-api.js'))
   //     .pipe(sourcemaps.write())
        .pipe(gulp.dest(''));
})

gulp.task('build_min', function(){
    return gulp.src('src/*.js')
     //   .pipe(sourcemaps.init())
        .pipe(rollup({
            // any option supported by Rollup can be set here.
            input: './src/index.commonjs.js',
            output:{
                format: 'cjs'
            }
        }))
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(uglify())
        .pipe(concat('feature-toggle-api.min.js'))
    //    .pipe(sourcemaps.write())
        .pipe(gulp.dest(''));
})

gulp.task('build_test', function(){
    return gulp.src('test.js')
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(concat('test-babel.js'))
        .pipe(gulp.dest(''));
})

gulp.task('build_plugins', function(){
    return gulp.src(['src/plugins/htmlplugin/plugin-html.js','src/plugins/urlplugin/plugin-url.js'])
     //   .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(uglify())
        //.pipe(concat('feature-toggle-api.min.js'))
    //    .pipe(sourcemaps.write())
        .pipe(gulp.dest(''));
})

gulp.task('build',['build_raw','build_min','build_plugins','build_module','build_test']);