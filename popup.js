let play=document.getElementById("play"),
	tail=document.getElementById("tail"),
	head=document.getElementById("head"),
	food=document.getElementById("food"),
	mid0=document.getElementById("mid0"),
	norm=document.getElementById("normal"),
	hard=document.getElementById("hard"),
	scoree=document.getElementById("score"),
	gameover=document.getElementById("gameover"),
	highscoree=document.getElementById("highscore"),
	flash=new Event("flash"),
	difficulty=0,
	speed=1,
	bodySpeed=113,
	moving,start,x,y,score,highscore,dir,anim,flashing,highscoreHard;
window.onload = function() {
	chrome.storage.sync.get("highscore", function(e) {
		highscore = e.highscore;
		highscoree.innerText = e.highscore;
	});
	chrome.storage.sync.get("highscoreHard", function(e) {
		highscoreHard = e.highscoreHard;
	});
};
function toggleDifficulty(d, s, bs) {
	clearInterval(flashing);
	highscoree.style.display = "initial";
	difficulty = d;
	speed = s;
	bodySpeed = bs;
}
norm.addEventListener("click", function() {
	toggleDifficulty(0, 1, 113);
	norm.style.color = "gray";
	hard.style.color = "white";
	norm.style.borderColor = "gray";
	hard.style.borderColor = "white";
	highscoree.innerText = highscore;
});
hard.addEventListener("click", function() {
	toggleDifficulty(1, 2, 45);
	hard.style.color = "gray";
	norm.style.color = "white";
	hard.style.borderColor = "gray";
	norm.style.borderColor = "white";
	highscoree.innerText = highscoreHard;
});
highscoree.addEventListener("flash", function() {
	var i = 0;
	clearInterval(flashing);
	highscoree.style.display = "none";
	flashing = setInterval(function() {
		highscoree.style.display = highscoree.style.display == "none" ? "initial" : "none";
		if (i++ == 8) {
			clearInterval(flashing);
			return;
		}
	}, 400);
});
function flashScore() {
	highscoree.innerText = score;
	highscoree.dispatchEvent(flash);
}
function gameOver() {
	start = 0;
	food.style.display = "none";
	gameover.style.display = "initial";
	setTimeout(function() {
		cancelAnimationFrame(moving);
		cancelAnimationFrame(anim);
		var mids = document.getElementsByClassName("mids");
		for (var i = mids.length-1; i >= 0; i--) {
			mids[i].remove();
		}
		setTimeout(function() {
			gameover.style.display = "none";
			if (difficulty) {
				if (score > highscoreHard) {
					chrome.storage.sync.set({highscoreHard: score});
					highscoreHard = score;
					flashScore();
				}
			}
			else {
				if (score > highscore) {
					chrome.storage.sync.set({highscore: score});
					highscore = score;
					flashScore();
				}
			}
			scoree.innerText = 0;
			head.style.transform = "none";
			mid0.style.transform = "none";
			tail.style.transform = "none";
			play.style.color = "white";
			play.style.borderColor = "white";
			if (difficulty) {
				norm.style.color = "white";
				norm.style.borderColor = "white";
				hard.style.color = "gray";
			}
			else {
				hard.style.color = "white";
				hard.style.borderColor = "white";
				norm.style.color = "gray";
			}
			play.disabled = false;
			norm.disabled = false;
			hard.disabled = false;
		}, 1500);
	}, 400);
}
function foodCollision() {
	if (x > food.x-7 && x < food.x+7 && y > food.y-7 && y < food.y+7) {
		return 1;
	}
	return 0;
}
function wallCollision() {
	if (x >= 83 || x <= -2 || y >= 74 || y <= -10) {
		return 1;
	}
	return 0;
}
function selfCollision() {
	for (var i = mid0; i.id != "food"; i = i.nextElementSibling) {
		if (x > i.x-4 && x < i.x+4 && y > i.y-4 && y < i.y+4) {
			return 1;
		}
	}
	return 0;
}
function snakeGrow() {
	scoree.innerText = ++score;
	mid0.insertAdjacentHTML("afterend", "<span class=\"sb mids\" id=\"mid"+score+"\">&#9632;</span>");
	var e = document.getElementById("mid"+score);
	e.style.transform = "translate("+mid0.x+"px,"+mid0.y+"px)";
	e.x = mid0.x;
	e.y = mid0.y;
}
function checkCollisions() {
	if (foodCollision()) {
		setFood();
		snakeGrow();
	}
	if (wallCollision() || selfCollision()) {
		gameOver();
		return 0;
	}
	return 1;
}
function setFood() {
	for (;;) {
		var l = Math.random()*82-2;
		var t = Math.random()*75-4;
		for (var i = head; i.id != "food"; i = i.nextElementSibling) {
			if (l > i.x-10 && l < i.x+10 && t < i.y+10 && t > i.y-10) {
				i = head;
				l = Math.random()*82-2;
				t = Math.random()*75-4;
				continue;
			}
		}
		food.style.transform = "translate("+l+"px,"+t+"px)";
		food.x = l;
		food.y = t;
		return;
	}
}
function moveBody(xp, yp) {
	var elm = mid0;
	var moveB = setInterval(function() {
		moving = window.requestAnimationFrame(function() {
			elm.style.transform = "translate("+xp+"px,"+yp+"px)"
			elm.x = xp;
			elm.y = yp;
			elm = elm.nextElementSibling;
			if (!elm || elm.id == "food") {
				clearInterval(moveB);
			}
		});
	}, bodySpeed);
}
function moveSnake() {
	head.x = x;
	head.y = y;
	moveBody(x, y);
}
function moveRight() {
	x += speed;
	head.style.transform = "translate("+x+"px,"+y+"px)";
	moveSnake();
	if (checkCollisions()) {
		anim = window.requestAnimationFrame(moveRight);
	}
}
function moveLeft() {
	x -= speed;
	head.style.transform = "translate("+x+"px,"+y+"px)";
	moveSnake();
	if (checkCollisions()) {
		anim = window.requestAnimationFrame(moveLeft);
	}
}
function moveUp() {
	y -= speed;
	head.style.transform = "translate("+x+"px,"+y+"px)";
	moveSnake();
	if (checkCollisions()) {
		anim = window.requestAnimationFrame(moveUp);
	}
}
function moveDown() {
	y += speed;
	head.style.transform = "translate("+x+"px,"+y+"px)";
	moveSnake();
	if (checkCollisions()) {
		anim = window.requestAnimationFrame(moveDown);
	}
}
function newDirection(d, ftn) {
	cancelAnimationFrame(anim);
	dir = d;
	anim = window.requestAnimationFrame(ftn);
}
document.addEventListener("keydown", function(e) {
	if (start) {
		e.preventDefault();
		switch(e.keyCode) {
			case 37:
				if (dir != "l" && dir != "r") {
					newDirection("l", moveLeft);
				}
				break;
			case 38:
				if (dir != "u" && dir != "d") {
					newDirection("u", moveUp);
				}
				break;
			case 39:
				if (dir != "r" && dir != "l") {
					newDirection("r", moveRight);
				}
				break;
			case 40:
				if (dir != "d" && dir != "u") {
					newDirection("d", moveDown);
				}
		}
	}
});
function initializeVals() {
	start = 1;
	score = 0;
	x = 0;
	y = 0;
	dir = 0;
	food.style.display = "initial";
	setFood();
	play.disabled = true;
	norm.disabled = true;
	hard.disabled = true;
	play.style.color = "gray";
	play.style.borderColor = "gray";
	if (difficulty) {
		hard.style.color = "Lime";
		hard.style.borderColor = "gray";
		norm.style.borderColor = "gray";
		norm.style.color = "gray";
	}
	else {
		norm.style.color = "Lime";
		norm.style.borderColor = "gray";
		hard.style.borderColor = "gray";
		hard.style.color = "gray";
	}
}
play.addEventListener("click", function(e) {
	e.preventDefault();
	initializeVals();
	newDirection("r", moveRight);
});
