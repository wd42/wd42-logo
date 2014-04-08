var join = require('path').join;
var gulp = require('gulp');
var gutil = require('gulp-util');

// Load plugins
var $ = require('gulp-load-plugins')();

// Lazyload modules that cause headaches otherwise
// See: https://github.com/jackfranklin/gulp-load-plugins#lazy-loading
$.connect = require("gulp-connect");
$.useref = require('gulp-useref');

var app = join(__dirname, 'src');
var dist = join(__dirname, 'build');

// Styles
gulp.task('styles', function () {
  return gulp.src(app + '/styles/scss/main.scss')
    .pipe($.rubySass({
      style: 'expanded'
    })).on('error', gutil.log)
    .pipe($.autoprefixer('last 1 version'))
    .pipe(gulp.dest(app + '/styles'))
    .pipe($.size());
});

// Scripts
gulp.task('scripts', function () {
  return gulp.src(app + '/scripts/**/*.js')
    .pipe($.jshint(__dirname  + '/.jshintrc'))
    .on('error', gutil.log)
    .pipe($.jshint.reporter('default'))
    .on('error', gutil.log)
    .pipe($.size());
});

// HTML
gulp.task('html', function () {
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');

  return gulp.src(app + '/*.html')
    .pipe($.useref.assets())
    .pipe(jsFilter)
    .pipe($.uglify())
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe($.minifyCss())
    .pipe(cssFilter.restore())
    .pipe($.useref.restore())
    .pipe($.useref())
    .pipe(gulp.dest(dist))
    .pipe($.size());
});

// Images
gulp.task('images', function () {
  return gulp.src(app + '/images/**/*')
    .pipe($.cache($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(dist + '/images'))
    .pipe($.size());
});

// Fonts
gulp.task('fonts', function () {
  return gulp.src(app + '/fonts/**/*')
    .pipe(gulp.dest(dist + '/fonts'))
    .pipe($.size());
});

// Clean
gulp.task('clean', function () {
  return gulp.src([
    dist + '/styles',
    dist + '/scripts',
    dist + '/images',
    dist + '/fonts'
  ], {read: false}).pipe($.clean());
});

// Build
gulp.task('build', ['styles', 'html', 'images', 'fonts']);

// Default task
gulp.task('default', ['clean'], function () {
  gulp.start('build');
});

// Connect
gulp.task('connect', $.connect.server({
  root: [app],
  port: 9000,
  livereload: true
}));

// Watch
gulp.task('watch', ['connect'], function () {
  // Watch for changes in `app` folder
  gulp.watch([
    app + '/*.html',
    app + '/styles/**/*.css',
    app + '/scripts/**/*.js',
    app + '/images/**/*',
    app + '/fonts/**/*'
  ], function(event) {
    return gulp.src(event.path)
      .pipe($.connect.reload());
  });

  // Watch .scss files
  gulp.watch(app + '/styles/**/*.scss', ['styles']);

  // Watch .js files
  gulp.watch(app + '/scripts/**/*.js', ['scripts']);

  // Watch image files
  gulp.watch(app + '/images/**/*', ['images']);
  //
  // Watch font files
  gulp.watch(app + '/fonts/**/*', ['fonts']);
});