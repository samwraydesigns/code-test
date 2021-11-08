// 'use strict';

// Load plugins
const gulp = require('gulp');
const batch = require('gulp-batch');
const log = require('fancy-log');
const PluginError = require('plugin-error');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const filter = require('gulp-filter');
const autoprefixer = require('gulp-autoprefixer');
const sprite = require('gulp-svg-sprite');
const uglify = require('gulp-uglify');
const cssnano = require('gulp-cssnano');
const eslint = require('gulp-eslint');
const concat = require('gulp-concat');
const modernizr = require('gulp-modernizr');
const webpack = require('webpack');


// we load the appropriate webpackConfig based on dev or production
let webpackConfig;


// The below variables are only in use during development.  They are not needed for the production build (i.e. when we run 'gulp deploy').  We set them in the setVars task which is a task that is only used during our default gulp task (i.e. when we run 'gulp')
let include;
let watch;


// Global config
const config = {
  browserSupport: ['last 2 versions', 'ie >= 9']
};


// Create a "paths" object for easier readability
const paths = (function () {
  let obj = {};

  obj.root = './';
  obj.src = obj.root + 'src/';
  obj.build = obj.root + 'build/';

  obj.templates = obj.root + 'templates/';

  obj.sass = obj.src + 'sass/';
  obj.css = obj.build + 'css/';

  obj.srcJS = obj.src + 'js/';
  obj.buildJS = obj.build + 'js/';
  obj.srcJSLibs = obj.srcJS + 'libs/';

  obj.images = obj.root + 'images/';
  obj.svg = obj.images + 'svg/';
  obj.sprites = obj.images + 'sprites/';

  return obj;
})();


gulp.task('modernizr', () => {
  return gulp.src([
    `${paths.srcJS}main.js`,
    `${paths.srcJS}modules/*.js`,
    `${paths.sass}**/*.scss`
  ])
  .pipe(modernizr({'options': ['setClasses', 'addTest', 'html5printshiv', 'testProp', 'fnBind']}))
  .pipe(uglify())
  .pipe(gulp.dest(paths.buildJS));
});


// Pipe HTML through BrowserSync
gulp.task('html', () => {
  return gulp.src(`${paths.templates}pages/*.html`)
  .pipe(include({
    prefix: '@@',
    basepath: '@file'
  }))
  .pipe(gulp.dest(`${paths.root}html/`))
  .pipe(browserSync.stream());
});


// Clean the CSS folder
gulp.task('cleanCSS', () => {
  return del(paths.css);
});


// Compile Sass & pipe through BrowserSync
gulp.task('sass', gulp.series('cleanCSS', () => {
  return gulp.src(`${paths.sass}*.scss`)
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(filter('**/*.css'))
  .pipe(autoprefixer({browsers: config.browserSupport}))
  .pipe(sourcemaps.write('maps'))
  .pipe(gulp.dest(paths.css))
  .pipe(browserSync.stream());
}));


// Clean the build folder
gulp.task('clean', () => {
  return del(paths.build);
});


// BrowserSync (See: https://browsersync.io/docs/options)
gulp.task('serve', () => {
  browserSync.init({
    server: paths.root,
    middleware: (req, res, next) => {
      req.url = req.url.replace('/Static/', '/');
      return next();
    },
    port: 8000, // Use a specific port (instead of the one auto-detected by Browsersync)
    ui: { // Browsersync includes a user-interface that is accessed via a separate port. The UI allows to controls all devices, push sync updates and much more.
      port: 8001
    },
    tunnel: false,  // Tunnel the Browsersync server through a random Public URL
    ghostMode: true // Clicks, Scrolls & Form inputs on any device will be mirrored to all others.
  });
});


// Create SVG sprite/symbol assets
gulp.task('sprites', () => {
  return gulp.src(`${paths.svg}*.svg`)
  .pipe(sprite({
    shape: {
      spacing: {
        padding: 0
      },
      transform: [{
        svgo: {
          plugins: [
            {convertStyleToAttrs: false}
          ]
        }}
      ]
    },
    mode: {
      // produces a symbols output for use with SVG fragment identifiers.
      symbol: {
        sprite: '../symbols.svg',
        bust: false
      }
    },
    svg: {
      namespaceClassnames : false
    }
  }))
  .pipe(gulp.dest(paths.sprites));
});


// Lint JS & pipe through BrowserSync
gulp.task('lint', () => {
  return gulp.src([`${paths.srcJS}**/*.js`, `!${paths.srcJSLibs}*.js`, `!${paths.srcJS}polyfills/*.js`])
  .pipe(eslint({configFile: `${paths.root}.eslintrc.yml`}))
  .pipe(eslint.format());
});


// Copy JS
gulp.task('copyJS', () => {
  return gulp.src([
    `${paths.srcJSLibs}jquery-3.2.1.min.js`,
    `${paths.srcJS}polyfills/*.js`
  ])
  .on('success', (succ) => {
    console.log('\033[92mJavascript copied successfully!\033[39m');
  })
  .on('error', (err) => {
    console.log('\033[91m' + err + '\033[39m');
    this.emit('end');
  })
  .pipe(gulp.dest(paths.buildJS))
  .pipe(browserSync.stream());
});


// Bundle ES6/ES5 modules in Webpack
gulp.task('bundleJS', (callback) => {
  webpack(webpackConfig, (err, stats) => {
    if (err) {
      new PluginError('webpack', err);
    }
    log.error('[webpack]', stats.toString());
    callback();
    browserSync.reload();
  });
});


// Concat JS Libs
gulp.task('concatJSLibs', () => {
  return gulp.src([
    `${paths.srcJSLibs}*.js`,
    `!${paths.srcJSLibs}jquery-3.2.1.min.js`
  ])
  .pipe(concat('libs.js'))
  .pipe(gulp.dest(paths.buildJS))
  .pipe(browserSync.stream());
});


// Minify JS Libs
gulp.task('minifyJSLibs', () => {
  const dest = paths.buildJS;
  return gulp.src([
    `${paths.srcJSLibs}*.js`,
    `!${paths.srcJSLibs}jquery-3.2.1.min.js`
  ])
  .pipe(concat('libs.js'))
  .pipe(uglify())
  .pipe(gulp.dest(dest));
});

// Minify JS
gulp.task('minifyJS', () => {
  return gulp.src([`${paths.buildJS}libs.js`])
  .pipe(uglify({
    compress: {
      drop_console: true
    }
  }))
  .pipe(gulp.dest(paths.buildJS));
});


// Minify CSS
gulp.task('minifyCSS', () => {
  return gulp.src(`${paths.css}**/*.css`)
  .pipe(cssnano({keepSpecialComments:0}))
  .pipe(gulp.dest(paths.css));
});


// watchAll function :: Watches files for changes
// * uses the gulp-watch npm package because standard
// gulp.watch doesn't track new or deleted files for changes
// We use gulp-batch so that we only run our test once rather than once per file changed.
// i.e if multiple files are changed in a small timeframe then gulp-batch prevents multiple method calls and treats them as one batch.  We may change loads of files in Sublime and then do a "Save All"
gulp.task('watchAll', () => {

  watch(`${paths.templates}**/*.html`, batch((events, done) => {
    gulp.series('html')(done);
  }));

  watch(`${paths.sass}**/*.scss`, batch((events, done) => {
    gulp.series('sass')(done);
  }));

  watch(`${paths.svg}**/*.svg`, batch((events, done) => {
    gulp.series('sprites', 'html')(done);
  }));

  watch([`${paths.srcJS}**/*.*`, `!${paths.srcJSLibs}*.js`, `!${paths.srcJS}polyfills/*.js`], batch((events, done) => {
    gulp.series('lint', 'bundleJS')(done);
  }));

  watch([`${paths.srcJSLibs}*.js`, `!${paths.srcJSLibs}jquery-3.2.1.min.js`, `!${paths.srcJS}polyfills/*.js`], batch((events, done) => {
    gulp.series('concatJSLibs')(done);
  }));

  watch([`${paths.srcJSLibs}jquery-3.2.1.min.js`, `${paths.srcJS}polyfills/*.js`], batch((events, done) => {
    gulp.series('copyJS')(done);
  }));

});


// A task that copies assets into the build folder
gulp.task('copyAll', gulp.parallel('copyJS', 'bundleJS', 'concatJSLibs'));


// A pre build task that is used for both dev and deploy
gulp.task('build', (callback) => {
  gulp.series(
    gulp.parallel('clean', 'lint', 'sprites'),
    gulp.parallel('sass', 'copyAll'),
    'modernizr'
  )(callback)
});


// The setVars task is used to require the modules.  This task is only used during development (i.e. when we run the default gulp task)
gulp.task('setVars', (callback)=> {

  // include is used in the task named 'html'
  include = require('gulp-file-include');

  // watch is used in the task named 'watchAll'
  watch = require('gulp-watch');

  callback();
});






// Default task for DEV build (Run 'gulp' at command line)
gulp.task('default', (callback) => {

  // load webpackConfig for dev
  webpackConfig = require('./webpack.dev.js');

  // require the modules now that we know we need them
  // not required for the "deploy" task

  // NOTE: The browserSync process must not be terminated, and watch and browserSync tasks must execute in parallel in order for live style injection to take place.
  gulp.series(
    'setVars', 'build', 'html',
    gulp.parallel('serve', 'watchAll')
  )(callback);
});


// Deployment task for PRODUCTION build (Run 'gulp deploy' at command line)
gulp.task('deploy', (callback) => {

  // load webpackConfig for prod
  webpackConfig = require('./webpack.prod.js');

  gulp.series(
    'build',
    gulp.parallel('minifyCSS', 'minifyJS')
  )(callback);

});