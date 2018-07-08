const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');

gulp.task('build_raw', function(){
    return gulp.src('src/index.js')
  //      .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(concat('feature-toggle-api.js'))
   //     .pipe(sourcemaps.write())
        .pipe(gulp.dest(''));
})

gulp.task('build_min', function(){
    return gulp.src('src/index.js')
     //   .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(uglify())
        .pipe(concat('feature-toggle-api.min.js'))
    //    .pipe(sourcemaps.write())
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

gulp.task('build',['build_raw','build_min','build_plugins']);