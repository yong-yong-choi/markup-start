var async       = require('async');
var gulp        = require('gulp');
var webserver   = require('gulp-webserver');
var livereload  = require('gulp-livereload');
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
var src         = 'project';
var paths       = {
        root: src,
        scss: src+'/scss/**/*.scss',
        css: src+'/css',
        spriteIn: src+'/images/sprite-in',
        spriteOut: src+'/images/sprite-out',
        imageSrc: '../images/sprite-out',
        spriteScssPath: src+'/scss/modules',
        rootCss: './css/style.css'
};

var fontName = 'font-icon'; // name of font
var fontClass = 'fico'; // name of class
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

/**
* ==============================+
* @SCSS : SCSS Config(환경설정)
* ==============================+
*/
var scssOptions = {

  /**
   * outputStyle (Type : String , Default : nested)
   * CSS의 컴파일 결과 코드스타일 지정
   * Values : nested, expanded, compact, compressed
   */
  outputStyle : "compressed",

  /**
  * indentType (>= v3.0.0 , Type : String , Default : space)
  * 컴파일 된 CSS의 "들여쓰기" 의 타입
  * Values : space , tab
  */
  indentType : "space",
  /**
  * indentWidth (>= v3.0.0, Type : Integer , Default : 2)
  * 컴파일 된 CSS의 "들여쓰기" 의 갯수
  */
  indentWidth : 2, // outputStyle 이 nested, expanded 인 경우에 사용

  /**
  * precision (Type : Integer , Default : 5)
  * 컴파일 된 CSS 의 소수점 자리수.
  */
  precision: 6,

  /**
  * sourceComments (Type : Boolean , Default : false)
  * 컴파일 된 CSS 에 원본소스의 위치와 줄수 주석표시.
  */
  sourceComments: false
};

// 웹서버를 localhost:8000 로 실행한다.
gulp.task('server', function () {
	return gulp.src(paths.root+'/')
		.pipe(webserver({
      port:'9090',
      livereload: true,
      open: true
    }));
});

// sass 파일을 css 로 컴파일한다.
gulp.task('sass:compile', function () {
  return gulp.src(paths.scss)

    // 소스맵 초기화(소스맵을 생성)
    .pipe(sourcemaps.init())

    // SCSS 함수에 옵션갑을 설정, SCSS 작성시 watch 가 멈추지 않도록 logError 를 설정
    .pipe(sass(scssOptions).on('error', sass.logError))

    // 위에서 생성한 소스맵을 사용한다.
    .pipe(sourcemaps.write())

    // 목적지(destination)을 설정
    .pipe(gulp.dest(paths.css));
});


gulp.task('sprite', function  () {
  // Use all normal and `-2x` (retina) images as `src`
  //   e.g. `github.png`, `github-2x.png`
  var spriteData = gulp.src(paths.spriteIn+'/*.png')
    .pipe(spritesmith({

      // Filter out `-2x` (retina) images to separate spritesheet
      //   e.g. `github-2x.png`, `twitter-2x.png`
      retinaSrcFilter: [paths.spriteIn+'/*-2x.png'],
      // Generate a normal and a `-2x` (retina) spritesheet
      retinaImgName:'spritesheet-2x.png',

      imgPath: paths.imageSrc+'/'+'spritesheet.png',
      retinaImgPath: paths.imageSrc+'/'+'spritesheet-2x.png',
      imgName: 'spritesheet.png',
      // Generate SCSS variables/mixins for both spritesheets
      cssName: '_sprites.scss',
       padding: 6,
       cssFormat: 'scss_retina',
       cssOpts: {
            cssClass: function(item) {
                return item.name;
            }
        }
    }));

  // imgStream = spriteData.img.pipe(gulp.dest(paths.spriteOut+'/'));
  // cssStream = spriteData.css.pipe(gulp.dest(paths.spriteScssPath+'/'));

  // Deliver spritesheets to `dist/` folder as they are completed
  var imgStream = spriteData.img
    .pipe(buffer())
    .pipe(imagemin())
    .pipe(gulp.dest(paths.spriteOut+'/'));


  // Deliver CSS to `./` to be imported by `index.scss`
  var cssStream = spriteData.css
    .pipe(csso())
    .pipe(gulp.dest(paths.spriteScssPath+'/'));


  return merge(imgStream, cssStream);
});

// 파일 변경 감지 및 브라우저 재시작
gulp.task('watch', function () {
  livereload.listen();
  gulp.watch(paths.spriteIn+'/*.*', ['sprite']);
  gulp.watch(paths.scss, function(){
    setTimeout(function () {
       gulp.task('sass:compile');
    }, 1000);
  });
  gulp.watch(src + '/**').on('change', livereload.changed);

});

// 기본 구동 task
gulp.task('default', [ 'watch', 'server']);