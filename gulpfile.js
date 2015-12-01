var gulp = require('gulp'),
   uglify = require('gulp-uglify');
   htmlmin = require('gulp-htmlmin');
   rename = require('gulp-rename');
   minifyCss = require('gulp-minify-css');
   minifyHTML = require('gulp-minify-html');

gulp.task('buildDist', function() {
  gulp.src(["./src/**", "!./src/**/*.js", "!./src/**/*.html", "!./src/**/*.css"])
    .pipe(gulp.dest("./dist"))
});

gulp.task('minify-html', function() {
  return gulp.src('./src/**/*.html')
    .pipe(minifyHTML())
    .pipe(gulp.dest('./dist'));
});

gulp.task('minifyJS', function () {
   gulp.src('./src/**/*.js')
      .pipe(uglify())
      .pipe(gulp.dest('./dist'))
});

gulp.task('minifyCSS', function() {
  return gulp.src('./src/**/*.css')
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build', ['buildDist', 'minify-html', 'minifyJS', 'minifyCSS']);
