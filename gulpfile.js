var async       = require('async');
var gulp        = require('gulp');

// js combine
// var concat      = require('gulp-concat');
// var uglify      = require('gulp-uglify');
// var rename      = require('gulp-rename');
var browserSync = require('browser-sync').create();

//sass
var sass        = require('gulp-sass');
var sourcemaps  = require('gulp-sourcemaps');
// sprite
var buffer      = require('vinyl-buffer');
var csso        = require('gulp-csso');
var imagemin    = require('gulp-imagemin');
var merge       = require('merge-stream');
var spritesmith = require('gulp.spritesmith');
// font
var iconfont    = require('gulp-iconfont');
var consolidate = require('gulp-consolidate');
// path
var paths       = {
      root: 'project',
      scssAll: 'project/scss/**/*.scss',
      scssRoot: 'project/scss/*.scss',
      scssModules: 'project/scss/modules/*.scss',
      bootstrap: 'project/scss/bootstrap/*.scss',
      css: 'project/css',
      spriteIn: 'project/images/sprite-in',
      spriteOut: 'project/images/sprite-out',
      imageSrc: '../images/sprite-out',
      spriteScssPath: 'project/scss/sprites/',
      rootCss: '/css/style.css',
      jsSrc : 'project/src/js/**/*.js',
      jsDist : 'project/js'
};

// @task : HTML livereload 반영
gulp.task('html', function () {
  return gulp .src('./**/*.html')
  // HTML 파일을 browserSync 로 브라우저에 반영 */
    .pipe(browserSync.reload({
      stream : true
    }));
});

/*
// @task : Script 병합,압축,min 파일 생성
gulp.task('js:combine', function () {
  return gulp .src(paths.jsSrc)
    .pipe(concat('combined.js'))
    .pipe(gulp.dest(paths.jsDist+'/js'))
    .pipe(uglify())
    .pipe(rename({suffix : ".min"}))
    .pipe(gulp.dest(paths.jsDist+'/js'))
    // 스크립트 파일을 browserSync 로 브라우저에 반영
    .pipe(browserSync.reload(
      {
        stream : true
      }
    ));
});
*/
gulp.task('js:combine', function() {
  return gulp.src([
    'node_modules/bootstrap/dist/js/bootstrap.min.js',
    'node_modules/jquery/dist/jquery.slim.js',
    'node_modules/popper.js/dist/umd/popper.min.js',
    'node_modules/holderjs/holder.min.js'
  ])
    .pipe(gulp.dest(paths.jsDist))
    .pipe(browserSync.stream());
});

// @SCSS : SCSS Config(환경설정)
var scssOptions = {
  // outputStyle (Type : String , Default : nested) CSS의 컴파일 결과 코드스타일 지정
  // Values : nested, expanded, compact, compressed
  outputStyle : "compressed",
  // indentType (>= v3.0.0 , Type : String , Default : space) 컴파일 된 CSS의 "들여쓰기" 의 타입
  // Values : space , tab
  indentType : "space",
  // indentWidth (>= v3.0.0, Type : Integer , Default : 2) 컴파일 된 CSS의 "들여쓰기" 의 갯수
  indentWidth : 1, // outputStyle 이 nested, expanded 인 경우에 사용
  // precision (Type : Integer , Default : 5) 컴파일 된 CSS 의 소수점 자리수.
  precision: 3,
  // sourceComments (Type : Boolean , Default : false) 컴파일 된 CSS 에 원본소스의 위치와 줄수 주석표시.
  sourceComments: false
};

// sass 파일을 css 로 컴파일한다.
gulp.task('sass:style', function () {
  return gulp.src([paths.scssAll])
    // 소스맵 초기화(소스맵을 생성)
    .pipe(sourcemaps.init())
    // SCSS 함수에 옵션갑을 설정, SCSS 작성시 watch 가 멈추지 않도록 logError 를 설정
    .pipe(sass(scssOptions).on('error', sass.logError))
    // 위에서 생성한 소스맵을 사용한다.
    .pipe(sourcemaps.write())
    // 목적지(destination)을 설정
    .pipe(gulp.dest(paths.css))
    // SCSS 컴파일을 수행한 후 browserSync 로 브라우저에 반영
    .pipe(browserSync.reload({
      stream : true
    }));
});

gulp.task('sass:bs', function () {
  return gulp.src([paths.bootstrap])
    // 소스맵 초기화(소스맵을 생성)
    .pipe(sourcemaps.init())
    // SCSS 함수에 옵션갑을 설정, SCSS 작성시 watch 가 멈추지 않도록 logError 를 설정
    .pipe(sass(scssOptions).on('error', sass.logError))
    // 위에서 생성한 소스맵을 사용한다.
    .pipe(sourcemaps.write())
    // 목적지(destination)을 설정
    .pipe(gulp.dest(paths.css+'/bootstrap'))
    // SCSS 컴파일을 수행한 후 browserSync 로 브라우저에 반영
    .pipe(browserSync.reload({
      stream : true
    }));
});

// sprite 생성
gulp.task('sprite', function  () {
  var spriteData = gulp.src(paths.spriteIn+'/*.png')
    .pipe(spritesmith({
      // (retina) images
      // retinaSrcFilter: [paths.spriteIn+'/*-2x.png'],
      // retinaImgName:'spritesheet-2x.png',
      // retinaImgPath: paths.imageSrc+'/'+'spritesheet-2x.png',

      imgPath: paths.imageSrc+'/'+'spritesheet.png',
      imgName: 'spritesheet.png',
      cssName: '_sprites.scss',
      padding: 6,
      cssFormat: 'scss', // scss_retina // (retina) images
      cssOpts: {
          // cssClass: function(item) {
          //     return '.sprite-' + item.name;
          // }
          cssClass: function(item) {
              return item.name;
          }
      }
    }));

  // Deliver spritesheets to `dist/` folder as they are completed
  var imgStream = spriteData.img
    .pipe(buffer())
    .pipe(imagemin())
    .pipe(gulp.dest(paths.spriteOut+'/'));

  // Deliver CSS to `./` to be imported by `index.scss`
  var cssStream = spriteData.css
    .pipe(csso())
    .pipe(gulp.dest(paths.spriteScssPath));

  return merge(imgStream, cssStream);
});

// 폰트 생성
var fontName = 'font-icon'; // name of font
var fontClass = 'ficon'; // name of class
gulp.task('iconfont', function(done){
  var iconStream = gulp.src([paths.root+'/font-icon/icons/*.svg']) // the location of all the svg files to be created into the font
    .pipe(iconfont({
      normalize: true,
      fontName: fontName,
      formats: ['ttf', 'eot', 'woff', 'woff2', 'svg'],
      appendCodepoints: true,
      fontHeight: 1001
    }))
    async.parallel([
    function handleGlyphs (cb) {
      iconStream.on('glyphs', function(glyphs, options) {
        // scss
        gulp.src(paths.root+'/font-icon/templates/_font-icon.scss')
          .pipe(consolidate('lodash', {
            glyphs: glyphs,
            fontName: options.fontName,
            fontPath:'../font-icon/fonts/',
            className: fontClass
          }))
          .pipe(gulp.dest(paths.root+'/scss/modules/'))
          .on('finish', cb);
          console.log(glyphs, options);
      });

    },
    function handleHtmlTemplate (cb) {
      iconStream.on('glyphs', function(glyphs, options) {
        // html
        gulp.src(paths.root+'/font-icon/templates/font-template.html')
          .pipe(consolidate('lodash', {
            glyphs: glyphs,
            fontName: options.fontName,
            className: fontClass,
            cssPath: paths.rootCss
          }))
          .pipe(gulp.dest(paths.root+'/'))
          .on('finish', cb);
          console.log('Create "font-template.html" file...');
      });
    },
    function handleFonts (cb) {
      iconStream
        .pipe(gulp.dest(paths.root+'/font-icon/fonts/'))
        .on('finish', cb);
    }
  ], done);
});

// @task : browserSync
gulp.task('browserSync', ['html', 'js:combine', 'sass:style', 'sass:bs'], function () {
  return browserSync.init({
      port : 3000,
      server: {
        baseDir: paths.root
      }
  });
});

// 파일 변경 감지 및 브라우저 재시작
gulp.task('watch', function () {
  gulp.watch('./**/*.html').on("change", browserSync.reload);
  //gulp.watch(paths.jsSrc, ['js:combine']).on("change", browserSync.reload);
  gulp.watch(paths.scssRoot, ['sass:style']).on("change", browserSync.reload);
  gulp.watch(paths.scssModules, ['sass:style']).on("change", browserSync.reload);
  gulp.watch(paths.bootstrap, ['sass:bs']).on("change", browserSync.reload);
  gulp.watch(paths.spriteIn+'/*.*', function(event){
    gulp.run(['sass:style']);
  }).on("change", browserSync.reload);
});

// 기본 구동 task
gulp.task('default', ['browserSync','sprite','watch']);