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
const autoprefixer = require('gulp-autoprefixer');
const validator = require('gulp-html');
const htmlmin = require('gulp-htmlmin');
const sourcemaps = require("gulp-sourcemaps");
const babel = require("gulp-babel");
const minify = require('babel-preset-minify');
const newer = require('gulp-newer');
const size = require('gulp-size');
const imagemin = require('gulp-imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');

// browserSync base directory
// this will be the base directory of files for web preview
// since we are building `index.pug` templates (located in src/emails) to `dist` folder.
const paths = {
  html: {
    src: './src/html/**/*.html',
    dest: './dist/'
  },
  styles: {
    src: './src/html/styles/**/*.scss',
    dest: './dist/css/'
  },
  scripts: {
    src: './src/html/scripts/**/*.js',
    dest: './dist/scripts/'
  },
  images: {
    src: './src/html/images/**/*',
    dest: './dist/images/',
  },
  baseDir: {
    src: './dist'
  }
};

// Supported Browsers
const supportedBrowsers = [
  'last 3 versions', // http://browserl.ist/?q=last+3+versions
  'ie >= 10', // http://browserl.ist/?q=ie+%3E%3D+10
  'edge >= 12', // http://browserl.ist/?q=edge+%3E%3D+12
  'firefox >= 28', // http://browserl.ist/?q=firefox+%3E%3D+28
  'chrome >= 21', // http://browserl.ist/?q=chrome+%3E%3D+21
  'safari >= 6.1', // http://browserl.ist/?q=safari+%3E%3D+6.1
  'opera >= 12.1', // http://browserl.ist/?q=opera+%3E%3D+12.1
  'ios >= 7', // http://browserl.ist/?q=ios+%3E%3D+7
  'android >= 4.4', // http://browserl.ist/?q=android+%3E%3D+4.4
  'blackberry >= 10', // http://browserl.ist/?q=blackberry+%3E%3D+10
  'operamobile >= 12.1', // http://browserl.ist/?q=operamobile+%3E%3D+12.1
  'samsung >= 4', // http://browserl.ist/?q=samsung+%3E%3D+4
];

// Config
const autoprefixConfig = { browsers: supportedBrowsers, cascade: false };
const babelConfig = { targets: { browsers: supportedBrowsers } };

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

task('buildPug', series(cleanDist, stylesHtml, pugBuild));

/*
 * Function for clean files in 'dist' and 'build' folder for new compile
 */

function cleanDist() {
  // You can use multiple globbing patterns as you would with `gulp.src`,
  // for example if you are using del 2.0 or above, return its promise
  return del(['dist/*']);
};

function cleanBuild() {
  return del(['build/*']);
};

/*
 * Define our tasks using plain functions
 */

function html() {
  return src(paths.html.src)
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(dest(paths.html.dest))
};

function stylesHtml() {
  return src(paths.styles.src)
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(autoprefixer(autoprefixConfig))
    .pipe(concat('styles.css'))
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(dest(paths.styles.dest))
    .pipe(browserSync.stream());

}

function scripts() {
  return src(paths.scripts.src, {
      sourcemaps: true
    })
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(dest(paths.scripts.dest));
};

function scriptsBabel() {
  return src(paths.scripts.src)
  .pipe(sourcemaps.init())
    .pipe(babel({
			presets: ['@babel/env', minify]
		}))
    .pipe(concat("all.js"))
    .pipe(sourcemaps.write("."))
    .pipe(dest(paths.scripts.dest));
}
/**************** images task ****************/

const imgConfig = {
  minOpts: [
    imagemin.gifsicle(),
    imagemin.jpegtran(),
    imagemin.optipng(),
    imagemin.svgo(),
    imageminPngquant(),
    imageminJpegRecompress(),
  ]
};

function imagesHtml() {
  return src(paths.images.src)
    .pipe(newer(paths.images.dest))
    .pipe(imagemin(imgConfig.minOpts))
    .pipe(size({
      showFiles: true
    }))
    .pipe(dest(paths.images.dest))
    .pipe(browserSync.stream());
}

// browserSync task to launch preview server
function connectToBrowser() {
  return browserSync.init({
    reloadDelay: 1000, // reload after 2s, compilation is (hopefully)
    server: {
      baseDir: paths.baseDir.src
    }
  });
};

// A simple task to reload the page
function reload() {
  browserSync.reload();
}

/*
 * Function for watching for file changed
 * first option path to folder
 * second option name function to some action for this files
 */

function watchingHtml() {
  connectToBrowser();
  watch(paths.scripts.src, scriptsBabel).on('change', reload);
  watch(paths.styles.src, stylesHtml);
  watch(paths.images.src, imagesHtml);
  watch(paths.html.src, html).on('change', reload);
};

task('html:dev', series(cleanDist,
  parallel(stylesHtml, scriptsBabel, html, imagesHtml),
  watchingHtml));
task('html:build', series(cleanBuild));
task('html:images', series(imagesHtml));
task('mail:dev', series(cleanDist));
task('mail:build', series(cleanBuild));

//// https: //goede.site/setting-up-gulp-4-for-automatic-sass-compilation-and-css-injection

//// https://www.sitepoint.com/automate-css-tasks-gulp/
