// Philip Salire

    /* Elements for head, tail and body of snake */
let snake_tail = document.getElementById("tail"),
    snake_head = document.getElementById("head"),
    snake_body = document.getElementById("mid0"),
    
    /* Snake's direction denoted by 'r' 'l' 'u' or 'd' */
    snake_direction = "r",
    
    /* Snake's x and y location */
    x = 0, y = 0,
    
    /* Snake's food */
    food = document.getElementById("food"),
    
    /* User buttons */
    play_button = document.getElementById("play"),
    normal_button = document.getElementById("normal"),
    hard_button = document.getElementById("hard"),
    score_display = document.getElementById("score"),
    
    /* Text displays for game over and high score */
    gameover_display = document.getElementById("gameover"),
    highscore_display = document.getElementById("highscore"),
    
    /* Event for flashing the score and interval for flashing */
    flash_score_event = new Event("flash"),
    flashing_interval,
    
    /* Difficulty: 0 for easy, 1 for hard */
    game_difficulty = 0,
    
    /* Snake movement speed, increment offset by this amount */
    snake_speed = 1,
    
    /* Interval time between each body element movement */
    body_time_interval = 113,
    
    /* animationFrames for snake movement  */
    snake_body_animationFrame,
    snake_move_animationFrame,
    
    /* Game start boolean */
    game_start = false,
    
    /* Current score and high score */
    game_score = 0,
    highscore_easy = 0,
    highscore_hard = 0;
    
/* Load highscores when window opened */
window.onload = function() {
    chrome.storage.sync.get("highscore", function(e) {
        highscore_easy = e.highscore;
        highscore_display.innerText = e.highscore;
    });
    chrome.storage.sync.get("highscoreHard", function(e) {
        highscore_hard = e.highscoreHard;
    });
};
/* Toggle between easy (0) and hard difficulty (1) */
function toggleDifficulty(difficulty, speed, body_speed) {
    clearInterval(flashing_interval);
    highscore_display.style.display = "initial";
    game_difficulty = difficulty;
    snake_speed = speed;
    body_time_interval = body_speed;
}
/* Click normal difficulty button */
normal_button.addEventListener("click", function() {
    toggleDifficulty(0, 1, 113);
    normal_button.style.color = "gray";
    hard_button.style.color = "white";
    normal_button.style.borderColor = "gray";
    hard_button.style.borderColor = "white";
    highscore_display.innerText = highscore_easy;
});
/* Click hard difficulty button */
hard_button.addEventListener("click", function() {
    toggleDifficulty(1, 2, 45);
    hard_button.style.color = "gray";
    normal_button.style.color = "white";
    hard_button.style.borderColor = "gray";
    normal_button.style.borderColor = "white";
    highscore_display.innerText = highscore_hard;
});
/* Event to flash the highscore when changed */
highscore_display.addEventListener("flash", function() {
    var i = 0;
    clearInterval(flashing_interval);
    highscore_display.style.display = "none";
    flashing_interval = setInterval(function() {
        highscore_display.style.display = highscore_display.style.display == "none" ? "initial" : "none";
        if (i++ == 8) {
            clearInterval(flashing_interval);
            return;
        }
    }, 400);
});
/* Activate flashing highscore event */
function flashScore() {
    highscore_display.innerText = game_score;
    highscore_display.dispatchEvent(flash);
}
/* Game is done, reset elements and check highscores */
function gameOver() {
    game_start = false;
    food.style.display = "none";
    gameover_display.style.display = "initial";
    setTimeout(function() {
        cancelAnimationFrame(snake_body_animationFrame);
        cancelAnimationFrame(snake_move_animationFrame);
        var mids = document.getElementsByClassName("mids");
        for (var i = mids.length-1; i >= 0; i--) {
            mids[i].remove();
        }
        setTimeout(function() {
            gameover_display.style.display = "none";
            if (game_difficulty) {
                if (game_score > highscore_hard) {
                    chrome.storage.sync.set({highscoreHard: game_score});
                    highscore_hard = game_score;
                    flashScore();
                }
            }
            else {
                if (game_score > highscore_easy) {
                    chrome.storage.sync.set({highscore: game_score});
                    highscore_easy = game_score;
                    flashScore();
                }
            }
            score_display.innerText = 0;
            snake_head.style.transform = "none";
            snake_body.style.transform = "none";
            snake_tail.style.transform = "none";
            play_button.style.color = "white";
            play_button.style.borderColor = "white";
            if (game_difficulty) {
                normal_button.style.color = "white";
                normal_button.style.borderColor = "white";
                hard_button.style.color = "gray";
            }
            else {
                hard_button.style.color = "white";
                hard_button.style.borderColor = "white";
                normal_button.style.color = "gray";
            }
            play_button.disabled = false;
            normal_button.disabled = false;
            hard_button.disabled = false;
        }, 1500);
    }, 400);
}
/* Check if snake eats food */
function foodCollision() {
    if (x > food.x-7 && x < food.x+7 && y > food.y-7 && y < food.y+7) {
        return true;
    }
    return false;
}
/* Check if snake hits wall */
function wallCollision() {
    if (x >= 83 || x <= -2 || y >= 74 || y <= -10) {
        return true;
    }
    return false;
}
/* Check if snake eats self */
function selfCollision() {
    for (var i = snake_body; i.id != "food"; i = i.nextElementSibling) {
        if (x > i.x-4 && x < i.x+4 && y > i.y-4 && y < i.y+4) {
            return true;
        }
    }
    return false;
}
/* Add body element to snake and increment score */
function snakeGrow() {
    score_display.innerText = ++game_score;
    snake_body.insertAdjacentHTML("afterend", "<span class=\"sb mids\" id=\"mid"+game_score+"\">&#9632;</span>");
    var e = document.getElementById("mid"+game_score);
    e.style.transform = "translate("+snake_body.x+"px,"+snake_body.y+"px)";
    e.x = snake_body.x;
    e.y = snake_body.y;
}
/* Check food, wall, and self collisions */
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
/* Set new position of food */
function setFood() {
    for (;;) {
        var l = Math.random()*82-2;
        var t = Math.random()*75-4;
        for (var i = snake_head; i.id != "food"; i = i.nextElementSibling) {
            if (l > i.x-10 && l < i.x+10 && t < i.y+10 && t > i.y-10) {
                i = snake_head;
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
/* Snake's body follows the head */
function moveBody(xp, yp) {
    var elm = snake_body;
    var moveB = setInterval(function() {
        snake_body_animationFrame = window.requestAnimationFrame(function() {
            elm.style.transform = "translate("+xp+"px,"+yp+"px)"
            elm.x = xp;
            elm.y = yp;
            elm = elm.nextElementSibling;
            if (!elm || elm.id == "food") {
                clearInterval(moveB);
            }
        });
    }, body_time_interval);
}
/* Move head and body of snake */
function moveSnake() {
    snake_head.x = x;
    snake_head.y = y;
    moveBody(x, y);
}
/* Move snake right, left, up, down */
function moveRight() {
    x += snake_speed;
    snake_head.style.transform = "translate("+x+"px,"+y+"px)";
    moveSnake();
    if (checkCollisions()) {
        snake_move_animationFrame = window.requestAnimationFrame(moveRight);
    }
}
function moveLeft() {
    x -= snake_speed;
    snake_head.style.transform = "translate("+x+"px,"+y+"px)";
    moveSnake();
    if (checkCollisions()) {
        snake_move_animationFrame = window.requestAnimationFrame(moveLeft);
    }
}
function moveUp() {
    y -= snake_speed;
    snake_head.style.transform = "translate("+x+"px,"+y+"px)";
    moveSnake();
    if (checkCollisions()) {
        snake_move_animationFrame = window.requestAnimationFrame(moveUp);
    }
}
function moveDown() {
    y += snake_speed;
    snake_head.style.transform = "translate("+x+"px,"+y+"px)";
    moveSnake();
    if (checkCollisions()) {
        snake_move_animationFrame = window.requestAnimationFrame(moveDown);
    }
}
/* Snake change of direction */
function newDirection(direction, fun) {
    cancelAnimationFrame(snake_move_animationFrame);
    snake_direction = direction;
    snake_move_animationFrame = window.requestAnimationFrame(fun);
}
/* Track up, down, left, right key presses */
document.addEventListener("keydown", function(e) {
    if (game_start) {
        e.preventDefault();
        switch(e.keyCode) {
            case 37:
                if (snake_direction != "l" && snake_direction != "r") {
                    newDirection("l", moveLeft);
                }
                break;
            case 38:
                if (snake_direction != "u" && snake_direction != "d") {
                    newDirection("u", moveUp);
                }
                break;
            case 39:
                if (snake_direction != "r" && snake_direction != "l") {
                    newDirection("r", moveRight);
                }
                break;
            case 40:
                if (snake_direction != "d" && snake_direction != "u") {
                    newDirection("d", moveDown);
                }
        }
    }
});
/* Initialize global values */
function initializeVals() {
    game_start = true;
    game_score = 0;
    x = 0;
    y = 0;
    food.style.display = "initial";
    setFood();
    play_button.disabled = true;
    normal_button.disabled = true;
    hard_button.disabled = true;
    play_button.style.color = "gray";
    play_button.style.borderColor = "gray";
    if (game_difficulty) {
        hard_button.style.color = "Lime";
        hard_button.style.borderColor = "gray";
        normal_button.style.borderColor = "gray";
        normal_button.style.color = "gray";
    }
    else {
        normal_button.style.color = "Lime";
        normal_button.style.borderColor = "gray";
        hard_button.style.borderColor = "gray";
        hard_button.style.color = "gray";
    }
}
/* Click play button */
play_button.addEventListener("click", function(e) {
    e.preventDefault();
    initializeVals();
    newDirection("r", moveRight);
});
