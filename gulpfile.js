var gulp = require('gulp'),
  uglify = require('gulp-uglify');

gulp.task('minify', function() {
  gulp
    .src(['css/*.css', 'images/**/*.jpg', 'images/**/*.JPG', 'images/**/*.gif', 'images/**/*.png', 'js/*.js', 'data/**', '!images/promo/**', '!images/nav/**'], {
      cwd: './dist',
      base: './dist'
    })
    .pipe(gulp.dest('./dist'))
});