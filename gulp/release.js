var gulp = require('gulp');
var bower = require('../bower.json');
var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'wiredep', 'karma', 'stream-series', 'del']
});

gulp.task('copyversion', ['clean'], function(){
    return gulp.src(['version.json'])
        .pipe(gulp.dest('roster'));
});

gulp.task('copycanary', ['clean'], function(){
    return gulp.src(['canary.json'])
        .pipe(gulp.dest('roster'));
});

gulp.task('images', ['clean', 'bower'], function(){
    return gulp.src(['bower_components/mos-frame/dist/images/*', 'images/*'])
        .pipe(gulp.dest('roster/images'));
});

gulp.task('fonts', ['clean', 'bower'], function(){
    return gulp.src(['fonts/*'])
        .pipe(gulp.dest('roster/fonts'));
});

gulp.task('app.compile', ['clean'], function(){
    return gulp.src(['components/**/*.js', '!components/**/*.spec.js'])
        .pipe($.angularFilesort())
        .pipe($.ngAnnotate())
        .pipe($.concat('app.js'))
        .pipe($.uglify())
        .pipe($.rev())
        .pipe(gulp.dest('roster'));
});

gulp.task('dep.compile', ['clean', 'bower'], function(){
    return gulp.src($.wiredep().js)
        .pipe($.ngAnnotate())
        .pipe($.concat('vendor.js'))
        .pipe($.uglify())
        .pipe($.rev())
        .pipe(gulp.dest('roster'));
});

gulp.task('css.compile', ['clean', 'bower', 'sass'], function(){
    var vendorStream = gulp.src($.wiredep({
        exclude: [/foundation\.css/, /foundation\.css.map/]
    }).css);
    var appStream = gulp.src('app.css');
    return $.streamSeries(vendorStream, appStream)
        .pipe($.minifyCss())
        .pipe($.concat('app.css'))
        .pipe($.rev())
        .pipe(gulp.dest('roster'));
});

gulp.task('templates', ['clean'], function(){
    gulp.src('./components/**/*.html')
        .pipe($.htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe($.ngTemplates({
            filename: 'templates.js',
            module: 'roster',
            standalone: false,
            path: function (path, base) {
                return path.replace(base, 'components/');
            }
        }))
        .pipe($.uglify())
        .pipe($.rev())
        .pipe(gulp.dest('roster'));
});

gulp.task('injectdist', ['app.compile', 'dep.compile', 'templates', 'css.compile'], function(){
    var vendorStream = gulp.src('vendor*.js', {
        cwd: 'roster'
    });
    var appStream = gulp.src('app*.*', {
        cwd: 'roster'
    });
    var templateStream = gulp.src('template*.js', {
        cwd: 'roster'
    });

    gulp.src('index.html')
        .pipe($.inject($.streamSeries(vendorStream, appStream, templateStream), {
            addRootSlash: false,
            name: 'dist'
        }))
        .pipe($.htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(gulp.dest('roster'));
});

gulp.task('bowerInstall', function(){
    return $.bower();
});

gulp.task('clean', function(cb){
    return $.del(['roster/*', '.tmp/*'], cb);
});

gulp.task('dist', ['clean', 'bowerInstall', 'build', 'app.compile', 'dep.compile', 'templates', 'css.compile', 'injectdist', 'copyversion', 'images', 'fonts', 'copycanary'], function(){

});