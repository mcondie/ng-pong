var gulp = require('gulp');
var bower = require('../bower.json');
var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'wiredep', 'karma', 'stream-series', 'connect-modrewrite']
});

gulp.task('bower', ['bowerInstall'], function () {
    return gulp.src('index.html')
    .pipe($.wiredep.stream({
        directory: 'bower_components',
        bowerJson: bower,
        exclude: [/foundation\.css/, /foundation\.css.map/]
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('injectjs', ['bower', 'createIndex'], function(){
    return gulp.src('index.html')
    .pipe($.inject(
        gulp.src(['components/**/*.js', '!components/**/*.spec.js'])
        .pipe($.angularFilesort()),
        {addRootSlash: false}
        ))
    .pipe(gulp.dest('.'))
    .pipe($.livereload());
});

gulp.task('updatejs', function(){
    return gulp.src('index.html')
    .pipe($.inject(
        gulp.src(['components/**/*.js', '!components/**/*.spec.js'])
        .pipe($.angularFilesort()),
        {addRootSlash: false}
        ))
    .pipe(gulp.dest('.'))
    .pipe($.livereload());
});

gulp.task('injectcss', ['sass', 'injectjs'], function(){
    return gulp.src('index.html')
    .pipe($.inject(
        gulp.src('app.css'),
            //$.streamSeries(gulp.src(['components/roster/*.css']), gulp.src(['components/**/*.css', '!components/roster/*.css'])),
            {addRootSlash: false}
            ))
    .pipe(gulp.dest('.'))
    .pipe($.livereload());
});

gulp.task('updatecss', function(){
    return gulp.src('index.html')
    .pipe($.inject(
        gulp.src('app.css'),
            //$.streamSeries(gulp.src(['components/roster/*.css']), gulp.src(['components/**/*.css', '!components/roster/*.css'])),
            {addRootSlash: false}
            ))
    .pipe(gulp.dest('.'))
    .pipe($.livereload());
});

gulp.task('sass', function(){
    return gulp.src(['components/**/*.scss',
        '!components/app/settings.scss',
        '!components/app/functions.scss',
        '!components/app/normalize.scss'])
    .pipe($.sourcemaps.init())
    .pipe($.sass())
    .pipe($.autoprefixer())
    .pipe($.concat('app.css'))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.'));
});

gulp.task('injectsvg',  ['bowerInstall', 'injectjs', 'injectcss'], function(){
  return gulp.src('index.html')
  .pipe($.inject(
      gulp.src('bower_components/imos-icons/icons.svg'),
      { transform: function(filePath, file){
          return file.contents.toString();
      }
  }
  ))
  .pipe(gulp.dest('./'));
});

gulp.task('watch', ['build'], function(){
    $.livereload.listen();
    gulp.watch(['components/**/*.scss'], ['updatecss']);
    gulp.watch(['components/**/*.js'], ['updatejs']);
    gulp.watch(['components/**/*.html'], ['html']);
    gulp.watch(['bower.json', 'config.json'], ['version', 'config']);
});

gulp.task('html', function(){
    gulp.src('../components/**/*.html')
    .pipe($.livereload());
});


gulp.task('version', function(){
    gulp.src('README.md')
    .pipe($.replace(/<!-- version:start -->[\s\S]*?<!-- version:end -->/, '<!-- version:start -->\n Current Version: ' + bower.version + '\n<!-- version:end -->'))
    .pipe(gulp.dest(''));

    gulp.src('version.json')
    .pipe($.jsonEditor({
        "version": bower.version
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('config', ['version'], function(){
    gulp.src('config.json')
    .pipe($.ngConfig('roster', {
        createModule: false,
        constants: {
            "appVersion": { "version" : bower.version }
        }
    }))
    .pipe($.concat('roster.constants.js'))
    .pipe(gulp.dest('components/roster'));
});

gulp.task('createIndex', function(){
    return gulp.src('index.tpl.html')
    .pipe($.rename('index.html'))
    .pipe(gulp.dest('.'));
});

gulp.task('build', ['bowerInstall', 'config', 'injectjs', 'injectcss', 'injectsvg'], function() {

});

gulp.task('serve', ['build', 'watch'], function(){
    $.connect.server({
        root: [__dirname],
        port: 9999,
        livereload: true,
        middleware: function() {
          return [
          $.connectModrewrite([
           '^/roster/(.*)$ http://localhost:9999/$1 [P]'
           ])
          ];
      }
  });
});