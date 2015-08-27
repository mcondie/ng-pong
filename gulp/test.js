var gulp = require('gulp');
var bower = require('../bower.json');
var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'wiredep', 'karma', 'stream-series']
});



gulp.task('test', function(done){
    $.karma.server.start({
        configFile: __dirname + '/../karma.conf.js',
        files: $.wiredep().js.concat([
        		'test/**/*.js',
            'components/**/*.module.js',
            'components/**/*.js'
        ])
    }, done);
});