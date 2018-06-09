const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');

gulp.task('build', function(){
    return gulp.src('src/*.js')
        .pipe(gulp.dest('dist/index.js'));
})

gulp.task('build_raw', function(){
    return gulp.src('src/index.js')
  //      .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(concat('feature-toggle-api.js'))
   //     .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist'));
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
        .pipe(gulp.dest('dist'));
})

gulp.task('build',['build_raw','build_min']);