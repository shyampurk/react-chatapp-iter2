"use strict";

var gulp = require('gulp');
var connect = require('gulp-connect');
var open = require('gulp-open');
var browserify=require('browserify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');
var concat = require('gulp-concat');
var nodemon = require('gulp-nodemon');
// var lint = require('gulp-eslint');

var config ={
	port:9005,
	devBaseUrl:'http://localhost',
	paths:{
		html:'./src/*.html',
		js:'./src/**/.js',
		css :[
	 	'styles/chat.css',
	 	'styles/ng-notify.theme.css'
	 ],
		dist:'./dist',
		mainJs:'./src/main.js'

	}
}

gulp.task('connect',function(){
	connect.server({
		root:['dist'],
		port:config.port,
		base:config.devBaseUrl,
		livereload:true
	});
});

gulp.task('open',['connect'],function(){
		gulp.src('dist/index.html')
 	.pipe(open({uri:config.devBaseUrl + ':' + config.port + '/'}));
});
gulp.task('html',function(){
	gulp.src(config.paths.html)
	.pipe(gulp.dest(config.paths.dist))
	.pipe(connect.reload());
});
// gulp.task('watch',function(){
// 	gulp.watch(config.paths.html,['html']);
// 	 gulp.watch(config.paths.js,['js','lint']);
// });
gulp.task('js',function(){
	browserify(config.paths.mainJs)
	.transform(reactify)
	.bundle()
	.on('error',console.error.bind(console))
	.pipe(source('bundle.js'))
	.pipe(gulp.dest(config.paths.dist + '/scripts'))
	.pipe(connect.reload());
});
gulp.task('css',function(){
		 gulp.src(config.paths.css)
	.pipe(concat('bundle.css'))
	.pipe(gulp.dest(config.paths.dist + '/css'));
});
// gulp.task('lint',function(){
// 	return gulp.src(config.paths.js)
// 	.pipe(lint({config:'eslint.config.json'}))
// 	.pipe(lint.format());
// });

gulp.task('default',['html','js','css','open'],function(){

});