var gulp = require('gulp'),
  webserver = require('gulp-webserver'),
  sass = require('gulp-sass'),
  livereload = require('gulp-livereload'),
  sourcemaps = require('gulp-sourcemaps');
var src = 'project';
var paths = {
  root: src,
  scss: src+'/scss/**/*.scss',
  css: src+'/css'
};

/** * ==============================+ * @SCSS : SCSS Config(환경설정) * ==============================+ */
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

// 파일 변경 감지 및 브라우저 재시작
gulp.task('watch', function () {
  livereload.listen();
  gulp.watch(paths.scss, ['sass:compile']);
  gulp.watch(paths.css + '/**').on('change', livereload.changed);
});

// 기본 구동 task
gulp.task('default', [ 'watch', 'server']);
