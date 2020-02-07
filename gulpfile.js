const { src, dest, watch, series, parallel } = require('gulp');
const Env = require('./config/env');
const cleanFolder = require('gulp-clean');
const cleanCSS = require('gulp-clean-css');
const terser = require('gulp-terser');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');

const DST_PATH = '../public/assets/dist';
const CSS_SRC = './views/src/stylesheets/*.css';
const CSS_DST = './public/assets/dist/css';
const JS_SRC_BASE = './views/src/javascripts/*.js';
const JS_SRC_SUBFOLDERS = './views/src/javascripts/*/*.js';
const JS_DST = './public/assets/dist/js';

/**
 * @task clean
 * cleans the destination directory of old files
 */
const clean = () => src(DST_PATH + '/*').pipe(cleanFolder());

// Watch changes on all *.css files and trigger buildStyles() at the end.
const watchCss = () => {
  watch(
    [CSS_SRC],
    { events: 'all', ignoreInitial: false },
    series(buildStyles)
  );
};

const watchJs = () => {
  watch(
    [JS_SRC_BASE],
    { events: 'all', ignoreInitial: false },
    series(buildScripts)
  );
};

const buildStyles = () => {
  if (Env.current === 'development') {
    return src(CSS_SRC)
      .pipe(cleanCSS())
      .pipe(rename({ suffix: '.min' }))
      .pipe(dest(CSS_DST));
  } else {
    return src(CSS_SRC)
      .pipe(cleanCSS())
      .pipe(rename({ suffix: '.min' }))
      .pipe(dest(CSS_DST));
  }
};

const buildScripts = () => {
  if (Env.current === 'development') {
    return src([JS_SRC_BASE, JS_SRC_SUBFOLDERS])
      .pipe(sourcemaps.init())
      .pipe(terser())
      .pipe(rename({ suffix: '.min' }))
      .pipe(sourcemaps.write())
      .pipe(dest(JS_DST));
  } else {
    return src([JS_SRC_BASE, JS_SRC_SUBFOLDERS])
      .pipe(terser())
      .pipe(rename({ suffix: '.min' }))
      .pipe(dest(JS_DST));
  }
};
/*
*
// Optimize Images
function images() {
  return gulp
    .src("./assets/img/** /*")
  .pipe(newer("./_site/assets/img"))
  .pipe(
    imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.jpegtran({ progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          {
            removeViewBox: false,
            collapseGroups: true
          }
        ]
      })
    ])
  )
  .pipe(gulp.dest("./_site/assets/img"));
}
*/

// Export commands.
exports.default = parallel(watchCss, watchJs); // $ gulp
exports.clean = clean; // $ gulp clean
exports.css = buildStyles; // $ gulp css
exports.js = buildScripts; // $ gulp js
exports.watchCSS = watchCss; // $ gulp watch
exports.watchJS = watchJs; // $ gulp watch
exports.build = series(clean, buildStyles, buildScripts); // $ gulp build