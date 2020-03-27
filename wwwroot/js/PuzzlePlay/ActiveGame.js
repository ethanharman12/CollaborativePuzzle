var connection;
const canvasId = "puzzleCanvas";
const imageId = "previewImage";
const image = document.getElementById(imageId);
var puzzleGame;
var gameArea;
var currentPiece;
var originalOffsetX = 0;
var originalOffsetY = 0;

var playerColor = "#" + Math.floor(Math.random() * 1000);
var defaultColor = "#A7A2A1";
var distanceSendThreshold = 5;
var currentDistance = 0;

function startGame() {
    gameArea = new gameArea(canvasId, 20);
    puzzleGame = new puzzleGame(gameArea, image, 8, 8, 500, 500);
    puzzleGame.cutPieces();
    puzzleGame.scatter(50, 900, 50, 700);

    gameArea.addComponent(puzzleGame);
    connection = new signalR.HubConnectionBuilder().withUrl("/puzzleHub").build();
    connection.on("MovePiece", function (row, column, x, y, playerColor) {
        var pieceToMove = puzzleGame.puzzle[row][column];
        pieceToMove.setBorderColor(playerColor);
        pieceToMove.move(x, y);
    });

    connection.on("StopPiece", function (row, column) {
        var pieceToMove = puzzleGame.puzzle[row][column];
        pieceToMove.setBorderColor(defaultColor);
        puzzleGame.snap(pieceToMove);
    });

    connection.on("GameOver", function () {
        gameOver();
    });

    connection.start().then(function () {
        gameArea.start();
        gameArea.canvas.onmousedown = startMoving;
        gameArea.canvas.onmousemove = movePiece;
        gameArea.canvas.onmouseup = stopMoving;
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
                currentPiece.row,
                currentPiece.column,
                event.offsetX - originalOffsetX,
                event.offsetY - originalOffsetY,
                playerColor).catch(function (err) {
                    return console.error(err.toString());
                });
        }
    }
}

function startMoving(event) {    
    currentPiece = puzzleGame.getClickedPiece(event.offsetX, event.offsetY);

    if (currentPiece) {
        originalOffsetX = event.offsetX - currentPiece.x;
        originalOffsetY = event.offsetY - currentPiece.y;
    }    
}

function stopMoving(event) {
    if (currentPiece) {
        puzzleGame.snap(currentPiece);
        connection.invoke("StopPiece", currentPiece.row, currentPiece.column).catch(function (err) {
            return console.error(err.toString());
        });
        currentPiece = null;

        if (puzzleGame.isCompleted()) {
            gameOver();
        }
    }    
}

function gameOver() {
    puzzleGame.complete();

    gameArea.endGame();
    gameArea.canvas.onmousedown = null;
    gameArea.canvas.onmousemove = null;
    gameArea.canvas.onmouseup = null;
}

$(document).ready(function () {
    startGame();
});