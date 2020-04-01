var connection;
const canvasId = "puzzleCanvas";
const imageId = "previewImage";
const friendSectionId = "friendSection";
const image = document.getElementById(imageId);
var puzzleGame;
var gameArea;
var currentPiece;
var originalOffsetX = 0;
var originalOffsetY = 0;

var playerColor = "#" + Math.floor(Math.random() * 1000);
var distanceSendThreshold = 5;
var currentDistance = 0;
var gameId;
var userName;
var rowCount = 8;
var columnCount = 8;

function startGame() {
    userName = window.localStorage.getItem("userName");
    if (!userName) {
        userName = prompt("User Name:");
        window.localStorage.setItem("userName", userName);
    }
    
    gameId = document.getElementById("GameId").value;
    gameArea = new gameArea(canvasId, 20);
    puzzleGame = new puzzleGame(gameArea, image, rowCount, columnCount, 500, 500, playerColor);
    puzzleGame.cutPieces();
    puzzleGame.scatter(50, 900, 50, 700);

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

    if (currentPiece) {
        originalOffsetX = event.offsetX - currentPiece.x;
        originalOffsetY = event.offsetY - currentPiece.y;
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