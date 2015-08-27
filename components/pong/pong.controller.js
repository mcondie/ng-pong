'use strict';
/*jshint esnext: true */

function PongController($interval){
	var pong = this;

	var squares = [{x: 10, y: 10, h: 50, w:50, d:1},
	{x: 100, y: 200, h: 50, w:50, d:-1},
	{x: 300, y: 500, h: 50, w:50, d:1}]
	var interval = 3;

	_.extend(pong, {
		squares: squares
	});

	$interval(function(){
		_.each(pong.squares, function(square){
			square.y += interval * square.d;
			if(square.y <= 0 || square.y >= 750){
				square.d = square.d * -1;
			}
		});
	}, 5);
}

angular.module('pong')
	.controller("PongController", PongController);