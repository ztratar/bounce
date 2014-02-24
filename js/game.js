$(function() {
	var $document = $(document),
		$window = $(window),
		windowSize = {
			width: $window.width(),
			height: $window.height()
		},
		gameInProgress = false,
		gameSpeed = 5,
		$title = $('.title'),
		$level = $('.level'),
		level = 0,
		$ball = $('.ball'),
		ballRadius = 20,
		ballPosition = {},
		initialBallPosition = {},
		ballDirection = {
			x: 1,
			y: 1
		},
		ballWalls = [],
		$paddle = $('.paddle'),
		paddleWidth = 300,
		paddlePosition = windowSize.width - paddleWidth / 2,
		$walls = $('.walls'),
		wallWidth = 280,
		drawBall,
		run;

	$window.on('resize.windowSizer', function() {
		windowSize = {
			width: $window.width(),
			height: $window.height()
		};
	});

	$document.on('mousemove', function(ev) {
		paddlePosition = Math.round(ev.pageX - paddleWidth / 2);
		$paddle.css({
			left: paddlePosition
		});
	});

	function setBallPosition() {
		ballPosition = $ball.position();
	}

	function addWall() {
		var $wall = $('<li class="wall"></li>'),
			wallCoords = {
				top: Math.round(Math.random() * windowSize.height),
				left: Math.round(Math.random() * windowSize.width)
			};

		_.each(ballWalls, function(wall) {
			if (wall.state === 'inactive') {
				wall.state = 'active';
				wall.$el.addClass('active');
			}
		});
		ballWalls.push(_.extend({
			state: 'inactive',
			$el: $wall
		}, wallCoords));

		$walls.append($wall);
		$wall.css(wallCoords);
	}

	run = function() {
		gameInProgress = true;
		gameSpeed = 5;
		level = 0;
		ballWalls = [];
		ballDirection = {
			x: 1,
			y: 1
		};
		$walls.html('');

		$title.addClass('inGame');
		$level.addClass('inGame');
		$ball.addClass('inGame');
		$paddle.addClass('inGame');
		$walls.addClass('inGame');

		setBallPosition();
		initialBallPosition = ballPosition;

		setTimeout(runRecur, 1000);
		setTimeout(function() {
			$ball.removeClass('inGame');
		}, 1010);
	};

	drawBall = _.throttle(function(position) {
		$ball.css(position);
	}, 16);

	runRecur = function() {
		var newPosition = {
				top: Math.round(ballPosition.top)-ballDirection.y * gameSpeed,
				left: Math.round(ballPosition.left)+ballDirection.x * gameSpeed
			},
			currentLevel = level;

		if (newPosition.top < 0) {
			newPosition.top = 1;
			ballDirection.y = -1;
			level++;
		} else if (newPosition.top > windowSize.height - 40 && 
				(newPosition.left > paddlePosition && 
				newPosition.left < paddlePosition + paddleWidth)) {
			newPosition.top = windowSize.height - 41;
			ballDirection.y = 1;
			level++;
		}
			
		if (newPosition.left < 0) {
			newPosition.left = 1;
			ballDirection.x = 1;
			level++;
		} else if (newPosition.left > windowSize.width) {
			newPosition.left = windowSize.width - 1;
			ballDirection.x = -1;
			level++;
		}

		_.each(ballWalls, function(wall) {
			if (wall.state === 'active' &&
					newPosition.top > wall.top &&
					ballDirection.y === -1 &&
					newPosition.left > wall.left &&
					newPosition.left < (wall.left + wallWidth)) {
				newPosition.top = wall.top;
				ballDirection.y = 1;
				wall.$el.remove();
				ballWalls = _.without(ballWalls, wall);
			}
		});

		if (level !== currentLevel) {
			$level.html(level);
			if (level % 10 === 0) {
				gameSpeed++;
			}
			if (level % 3 === 0) {
				addWall();
			}
		}

		ballPosition = newPosition;
		drawBall(newPosition);

		if (newPosition.top > windowSize.height) {
			// Lost the game
			$title.removeClass('inGame');
			$ball.removeClass('inGame');
			$paddle.removeClass('inGame');
			$walls.removeClass('inGame');

			gameInProgress = false;
			$ball.animate(initialBallPosition, 1400);
		} else {
			setTimeout(runRecur, 1);
		}
	};

	$('body').on('click', function() {
		if (!gameInProgress) {
			run();
		}
	});
});
