var connection;
const canvasId = "puzzleCanvas";
const imageId = "previewImage";
const friendSectionId = "friendSection";
var puzzleGame;
var gameArea;
var currentPiece;
var originalOffsetX = 0;
var originalOffsetY = 0;

var inLink = false;

var playerColor = "#" + Math.floor(Math.random() * 1000);
var distanceSendThreshold = 5;
var currentDistance = 0;
var gameId;
var userName;
var rowCount = 8;
var columnCount = 8;
var isVideo;
const image = document.getElementById(imageId);

function startGame() {
    if (isVideo) {
        image.removeEventListener('play', startGame);
    }
    
    userName = window.localStorage.getItem("userName");
    while (!userName) {
        userName = prompt("User Name:");
    }
    window.localStorage.setItem("userName", userName);
    
    gameArea = new gameArea(canvasId, 20);
    puzzleGame = new puzzleGame(gameArea, image, isVideo, rowCount, columnCount, 500, 500, playerColor);
    puzzleGame.cutPieces();
    puzzleGame.scatter(50, 900, 50, 600);

    gameArea.addComponent(puzzleGame);
    connection = new signalR.HubConnectionBuilder().withUrl("/puzzleHub").build();
    connection.on("MovePiece", function (row, column, x, y, otherPlayerColor) {
        var pieceToMove = puzzleGame.puzzle[row][column];
        pieceToMove.setBorderColor(otherPlayerColor);
        pieceToMove.move(x, y);
    });

    connection.on("StopPiece", function (row, column) {
        var pieceToMove = puzzleGame.puzzle[row][column];
        pieceToMove.setBorderColor(playerColor);
        puzzleGame.snap(pieceToMove);
    });

    connection.on("PiecesRequest", function () {
        var puzzlePiecesDto = [];
        for (var row = 0; row < rowCount; row++) {
            for (var column = 0; column < columnCount; column++) {
                var piece = puzzleGame.puzzle[row][column];
                puzzlePiecesDto.push({
                    row: row,
                    column: column,
                    x: piece.x,
                    y: piece.y
                });            
            }
        }

        connection.invoke("StartGame", gameId, puzzlePiecesDto).catch(function (err) {
            return console.error(err.toString());
        });
    });

    //connection.on("SetupPieces", function (pieces) {
    //    for (var row = this.numberOfPiecesHigh - 1; row >= 0; row--) {
    //        for (var column = this.numberOfPiecesWide - 1; column >= 0; column--) {
    //            var piece = this.puzzle[row][column];
    //            if (y > piece.y && y < piece.y + piece.height
    //                && x > piece.x && x < piece.x + piece.width) {
    //                return piece;
    //            }
    //        }
    //    }
    //});

    connection.on("PlayerJoined", function (name, color) {
        var html = '<div>' +
            '<span style="color: ' + color + ';font-size:40px;font-weight:bold;">' + name + '</span>' +
            '</div>';

        $("#" + friendSectionId).append(html);
    });

    connection.start().then(function () {
        connection.invoke("JoinGame", gameId, userName, playerColor).catch(function (err) {
            return console.error(err.toString());
        });

        gameArea.start();
        var canvas = gameArea.canvas;
        canvas.onmousedown = startMoving;
        canvas.onmousemove = movePiece;
        canvas.onmouseup = stopMoving;

        // Set up touch events for mobile, etc
        canvas.addEventListener("touchstart", function (e) {
            e.preventDefault();
            displayDebugParameters(e);
            //var mouseEvent = new MouseEvent("mousedown", getTouchPos(e));
            //gameArea.canvas.dispatchEvent(mouseEvent);
            startMoving(getTouchPos(e));
        }, false);
        canvas.addEventListener("touchend", function (e) {
            e.preventDefault();
            //var mouseEvent = new MouseEvent("mouseup", getTouchPos(e));
            //gameArea.canvas.dispatchEvent(mouseEvent);
            stopMoving();
        }, false);
        canvas.addEventListener("touchmove", function (e) {
            e.preventDefault();
            displayDebugParameters(e);
            //var mouseEvent = new MouseEvent("mousemove", getTouchPos(e));
            //gameArea.canvas.dispatchEvent(mouseEvent);
            movePiece(getTouchPos(e));
        }, false);        
    }).catch(function (err) {
        return console.error(err.toString());
    });
}

function movePiece(event) {
    if (currentPiece) {        

        var xdistance = event.offsetX - originalOffsetX;
        var ydistance = event.offsetY - originalOffsetY;

        var maxTraveled = Math.max(Math.abs(xdistance - currentPiece.x), Math.abs(ydistance - currentPiece.y));
        currentDistance += maxTraveled;

        currentPiece.move(xdistance, ydistance);

        if (currentDistance > distanceSendThreshold) {
            currentDistance = 0;
            connection.invoke(
                "MovePiece",
                gameId,
                currentPiece.row,
                currentPiece.column,
                event.offsetX - originalOffsetX,
                event.offsetY - originalOffsetY,
                playerColor).catch(function (err) {
                    return console.error(err.toString());
                });

            for (var i = 0; i < currentPiece.pieceHolder.pieces.length; i++) {
                var groupedPiece = currentPiece.pieceHolder.pieces[i];
                if (currentPiece !== groupedPiece) {
                    connection.invoke(
                        "MovePiece",
                        gameId,
                        groupedPiece.row,
                        groupedPiece.column,
                        event.offsetX - originalOffsetX + (groupedPiece.column - currentPiece.column) * groupedPiece.width,
                        event.offsetY - originalOffsetY + (groupedPiece.row - currentPiece.row) * groupedPiece.height,
                        playerColor).catch(function (err) {
                            return console.error(err.toString());
                        });
                }
            }
        }
    }
}

function startMoving(event) {    
    currentPiece = puzzleGame.getClickedPiece(event.offsetX, event.offsetY);

    //var touches = [];
    //touches.push({clientX: 1, pageX: 2, screenX: 3});
    //displayDebugParameters({targetTouches: touches});
    
    if (currentPiece) {
        $("#touchedId").text(currentPiece.row + " " + currentPiece.column);

        originalOffsetX = event.offsetX - currentPiece.x;
        originalOffsetY = event.offsetY - currentPiece.y;
    }
    else {
        $("#touchedId").text("Miss: " + event.offsetX + " " + event.offsetY);
    }
}

function stopMoving(event) {
    if (currentPiece) {
        puzzleGame.snap(currentPiece);
        connection.invoke("StopPiece", gameId, currentPiece.row, currentPiece.column).catch(function (err) {
            return console.error(err.toString());
        });
        currentPiece = null;

        if (puzzleGame.isCompleted()) {
            gameOver();
        }
    }    
}

var linkUrl = $("#startLink").attr("href");
var linkText = "New Puzzle";
function gameOver() {     
    
    gameArea.canvas.onmousedown = null;
    gameArea.canvas.onmousemove = null;
    gameArea.canvas.onmouseup = null;

    gameArea.endGame();

    showLink();
    puzzleGame.complete();

    //$("#newGameLink").show();
}

$(document).ready(function () {
    gameId = document.getElementById("GameId").value;
    rowCount = document.getElementById("NumberOfRows").value;
    columnCount = document.getElementById("NumberOfColumns").value;
    isVideo = document.getElementById("IsVideo").value === 'True';

    if (isVideo) {
        image.addEventListener('play', startGame, false);
    }
    else {
        startGame();
    }
});

// Get the position of a touch relative to the canvas
function getTouchPos(touchEvent) {
    var rect = touchEvent.target.getBoundingClientRect();
    var x = touchEvent.targetTouches[0].clientX - rect.left;
    var y = touchEvent.targetTouches[0].clientY - rect.top;

    return {
        offsetX: x,
        offsetY: y
    };
}

function displayDebugParameters(touchEvent) {

    //var rect = touchEvent.target.getBoundingClientRect();
    //var touch = touchEvent.targetTouches[0];

    //$("#touchId").text(touch.identifier);
    //$("#clientX").text(touch.clientX);
    //$("#clientY").text(touch.clientY);
    //$("#pageX").text(touch.pageX);
    //$("#screenX").text(touch.screenX);
    //$("#rectLeft").text(rect.left);
    //$("#rectTop").text(rect.top);
    //$("#pieceX").text(puzzleGame.puzzle[0][0].x);
    //$("#pieceY").text(puzzleGame.puzzle[0][0].y);
}

var linkX = 400;
var linkY = 400;
var linkHeight;
var linkWidth;

this.showLink = function () {

    var ctx = gameArea.canvas.getContext("2d");

    ctx.beginPath();
    ctx.rect(linkX - 20, linkY - 50, 200, 80);
    ctx.fillStyle = "black";
    ctx.fill();

    //draw the link
    ctx.font = '30px sans-serif';
    ctx.fillStyle = "#ffffff";
    ctx.fillText(linkText, linkX, linkY);
    linkWidth = ctx.measureText(linkText).width;
    linkHeight = 60;

    //add mouse listeners
    gameArea.canvas.addEventListener("mousemove", on_mousemove, false);
    gameArea.canvas.addEventListener("click", on_click, false);
};

//check if the mouse is over the link and change cursor style
function on_mousemove(ev) {
    var x, y;
    x = ev.offsetX;
    y = ev.offsetY;

    //is the mouse over the link?
    if (x >= linkX - 20 && x <= linkX + 200 && y <= linkY + 30 && y >= linkY - 50) {
        gameArea.canvas.style.cursor = "pointer";
        inLink = true;
    }
    else {
        gameArea.canvas.style.cursor = "default";
        inLink = false;
    }
}

//if the link has been clicked, go to link
function on_click(e) {
    if (inLink) {
        window.location = linkText;
    }
}