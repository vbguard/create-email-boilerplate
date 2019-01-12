const { src, dest, watch, series, parallel, task } = require('gulp');
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
    html: {
      dest: 'dist'
    },
    styles: {
      src: 'src/styles/**/*.less',
      dest: 'dist/styles/'
    },
    scripts: {
      src: 'src/scripts/**/*.js',
      dest: 'dist/scripts/'
    },
    baseDir: {
        src: './dist'
    }
  };

// compile sass to css
function compileSass() { 
    return src('./src/sass/**/*.scss')
    .pipe(sass()
    .on('error', sass.logError))
    .pipe(gulp.dest('./src/css'));
};

// build complete HTML email template
// compile sass (compileSass task) before running build
async function build(cb) {
    await compileSass();
    return src('src/emails/**/*.template.pug')
        .pipe(replace(new RegExp('\/sass\/(.+)\.scss', 'ig'), '/css/$1.css'))
        .pipe(pug())
        .pipe(inlineCss())
        .pipe(rename({dirname: ''}))
        .pipe(gulp.dest(paths.html.dest));
    cb();
};

// browserSync task to launch preview server
function sync(cb) {
    return browserSync.init({
        reloadDelay: 2000, // reload after 2s, compilation is finished (hopefully)
        server: { baseDir: paths.baseDir.src }
    });
    cb();
};

// task to reload browserSync
function reloadBrowserSync() {
    return browserSync.reload();
};

// watch source files for changes
// run `build` task when anything inside `src` folder changes (except .css)
// and reload browserSync
async function watchFile() {
  await build();
    return watch([
        'src/**/*',
        '!src/**/*.css',
    ], series(build, reloadBrowserSync));
};


 

 
/* Not all tasks need to use streams, a gulpfile is just another node program
 * and you can use all packages available on npm, but it must return either a
 * Promise, a Stream or take a callback and call it
 */
function clean() {
  // You can use multiple globbing patterns as you would with `gulp.src`,
  // for example if you are using del 2.0 or above, return its promise
  return del([ 'assets' ]);
}
 
/*
 * Define our tasks using plain functions
 */
function styles() {
  return src(paths.styles.src)
    .pipe(cleanCSS())
    // pass in options to the stream
    .pipe(rename({
      basename: 'main',
      suffix: '.min'
    }))
    .pipe(dest(paths.styles.dest));
}
 
function scripts() {
  return src(paths.scripts.src, { sourcemaps: true })
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(dest(paths.scripts.dest));
}
 
// function watch() {
//   gulp.watch(paths.scripts.src, scripts);
//   gulp.watch(paths.styles.src, styles);
// }
 
/*
 * You can use CommonJS `exports` module notation to declare tasks
 */
exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
 
/*
 * Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
 */
var build = series(clean, parallel(styles, scripts));
 

exports.default = series(clean, build, watchFile, sync);