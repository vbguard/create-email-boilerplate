const {
  src,
  dest,
  watch,
  series,
  parallel,
  task
} = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const replace = require('gulp-replace');
const inlineCss = require('gulp-inline-css');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const del = require('del');

// browserSync base directory
// this will be the base directory of files for web preview
// since we are building `index.pug` templates (located in src/emails) to `dist` folder.
const paths = {
  styles: {
    src: './src/styles/**/*.scss',
    dest: './dist/styles/'
  },
  scripts: {
    src: './src/scripts/**/*.js',
    dest: './dist/scripts/'
  },
  baseDir: {
    src: './dist'
  }
};

// compile sass to css
function compileSass() {

};

// build complete HTML email template
// compile sass (compileSass task) before running build
function pugBuild() {
  return src('src/emails/**/*.template.pug')
    .pipe(pug())
    .pipe(inlineCss())
    .pipe(rename({
      dirname: 'mail'
    }))
    .pipe(dest('dist'))
};

task('buildPug', series(cleanDist, styles, pugBuild));

// browserSync task to launch preview server
function connectToBrowser() {
  return browserSync.init({
    reloadDelay: 2000, // reload after 2s, compilation is (hopefully)
    server: {
      baseDir: paths.baseDir.src
    }
  });

  // return browserSync.init({
  //     reloadDelay: 2000, // reload after 2s, compilation is finished (hopefully)
  //     server: { baseDir: paths.baseDir.src }
  // });
};

/*
 * Function for clean files in 'dist' and 'build' folder for new compile 
 */

function cleanDist() {
  // You can use multiple globbing patterns as you would with `gulp.src`,
  // for example if you are using del 2.0 or above, return its promise
  return del(['dist/*']);
}

function cleanBuild() {
  return del(['build/*']);
}

/*
 * Define our tasks using plain functions
 */
function styles() {
  return src('./src/styles/**/*.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(concat('styles.css'))
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(dest('./dist/css/'));

}

function scripts() {
  return src(paths.scripts.src, {
      sourcemaps: true
    })
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(dest(paths.scripts.dest));
}

/*
 * Function for watching for file changed
 * first option path to folder
 * second option name function to some action for this files
 */

function watching() {
  watch(paths.scripts.src, scripts);
  watch(paths.styles.src, styles);
};

task('default', series(cleanDist, styles));