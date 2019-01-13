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
const autoprefixer = require('autoprefixer');
const replace = require('gulp-replace');
const inlineCss = require('gulp-inline-css');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const autoprefixer = require('gulp-autoprefixer');

// browserSync base directory
// this will be the base directory of files for web preview
// since we are building `index.pug` templates (located in src/emails) to `dist` folder.
const paths = {
  html: {
    src: './src/html/'
  },
  styles: {
    src: './src/styles/**/*.scss',
    dest: './dist/styles/'
  },
  scripts: {
    src: './src/scripts/**/*.js',
    dest: './dist/scripts/'
  },
  images: {
    src: './src/images/**/*',
    dest: './dist/images/',
  },
  baseDir: {
    src: './dist'
  }
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

task('buildPug', series(cleanDist, stylesHtml, pugBuild));

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
function stylesHtml() {
  return src('./src/styles/**/*.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(autoprefixer({
<<<<<<< HEAD
        browsers: ['> 1%'],
=======
      browsers: '> 0.1%'
>>>>>>> 9446691fe09ee4c58df3e271e1b5374d49e3f496
    }))
    .pipe(concat('styles.css'))
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(dest('./dist/css/'))
    .pipe(browserSync.stream());

}

function scripts() {
  return src(paths.scripts.src, {
      sourcemaps: true
    })
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(dest(paths.scripts.dest));
}

/**************** images task ****************/

const imgConfig = {
  minOpts: {
    optimizationLevel: 5
  }
};

function imagesHtml() {
  return src(path.images.src)
    .pipe(newer(path.images.dest))
    .pipe(imagemin(imgConfig.minOpts))
    .pipe(size({
      showFiles: true
    }))
    .pipe(dest(path.images.dest));
}

// browserSync task to launch preview server
function connectToBrowser() {
  return browserSync.init({
    reloadDelay: 2000, // reload after 2s, compilation is (hopefully)
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
  watch(paths.scripts.src, scripts);
  watch(paths.styles.src, stylesHtml);
  watch(paths.html.src).on('change', reload);
};

<<<<<<< HEAD
task('default', series(cleanDist, styles));
=======
task('html:dev', series(cleanDist,
  parallel(stylesHtml, scripts),
  watchingHtml));
task('html:build', series(cleanBuild));
task('html:images', series(imagesHtml));
task('mail:dev', series(cleanDist));
task('mail:build', series(cleanBuild));

//// https: //goede.site/setting-up-gulp-4-for-automatic-sass-compilation-and-css-injection

//// https://www.sitepoint.com/automate-css-tasks-gulp/
>>>>>>> 9446691fe09ee4c58df3e271e1b5374d49e3f496
