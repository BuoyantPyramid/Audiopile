'use strict';

var gulp = require('gulp');
var sync = require('browser-sync');
var reload = sync.reload;
var nodemon = require('gulp-nodemon');
var closureCompiler = require('gulp-closure-compiler');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var ngmin = require("gulp-ngmin");
var prefix = require('gulp-autoprefixer');

// the paths to our app files
var paths = {
  scripts: ['client/app/**/*.js'],
  html: ['client/app/**/*.html', 'client/index.html'],
  styles: ['client/app/styles/*.scss'],
  test: ['tests/**/*.js']
};

// Sass and css injecting
gulp.task('sass', function () {
  return gulp.src(paths.styles)
  .pipe(sass({outputStyle: 'compressed', sourceComments: 'map'}, {errLogToConsole: true}))
  .pipe(prefix('last 2 versions', '> 1%', 'ie 8', 'Android 2', 'Firefox ESR'))
  .pipe(gulp.dest('client/dist'))
  .pipe(reload({stream: true}));
});

gulp.task('browser-sync', ['nodemon'], function() {
  sync.init(null, {
    proxy: 'http://localhost:3000',
    port: 5000
  });
});

// Minify the things
gulp.task('build', function() {
  return gulp.src(paths.scripts)
    .pipe(ngmin())
    .pipe(concat('main.js'))   // Combine into 1 file
    .pipe(gulp.dest('client/dist'))            // Write non-minified to disk
    .pipe(uglify())                     // Minify
    .pipe(rename({extname: '.min.js'})) // Rename to ng-quick-date.min.js
    .pipe(gulp.dest('client/dist'));            // Write minified to disk
});

gulp.task('nodemon', function (cb) {
  var called = false;
  return nodemon({script: 'server/server.js'}).on('start', function () {
    if (!called) {
      called = true;
      cb();
    }
  });
});

gulp.task('default', ['sass', 'build', 'browser-sync'], function () {
  gulp.watch(paths.styles, ['sass']);
  gulp.watch(['client/**/*.js', './*.html'], ['build', reload]);
});
