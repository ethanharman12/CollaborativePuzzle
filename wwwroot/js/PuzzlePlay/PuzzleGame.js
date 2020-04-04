function puzzleGame(
    gameArea,
    image,
    isVideo,
    numberOfPiecesHigh,
    numberOfPiecesWide,
    squareHeight,
    squareWidth,
    playerColor
) {
    this.numberOfPiecesHigh = numberOfPiecesHigh;
    this.numberOfPiecesWide = numberOfPiecesWide;
    this.squareHeight = squareHeight;
    this.squareWidth = squareWidth;
    this.playerColor = playerColor;

    this.pieceHeight = squareHeight / numberOfPiecesHigh;
    this.pieceWidth = squareWidth / numberOfPiecesWide;

    this.puzzle = [];
    this.snapCount = 0;
    this.isVideo = isVideo;

    this.cutPieces = function () {

        var imageHeight = image.naturalHeight;
        var imageWidth = image.naturalWidth;

        if (this.isVideo) {
            imageHeight = image.videoHeight;
            imageWidth = image.videoWidth;
        }

        var pieceImageHeight = Math.ceil(imageHeight / this.numberOfPiecesHigh);
        var pieceImageWidth = Math.ceil(imageWidth / this.numberOfPiecesWide);

        for (var row = 0; row < this.numberOfPiecesHigh; row++) {
            this.puzzle.push([]);
            for (var column = 0; column < this.numberOfPiecesWide; column++) {
                this.puzzle[row].push(
                    new puzzlePiece(
                        gameArea,
                        image,
                        row,
                        column,
                        this.pieceWidth,
                        this.pieceHeight,
                        (this.pieceWidth + 5) * column,
                        (this.pieceHeight + 5) * row,
                        pieceImageHeight,
                        pieceImageWidth,
                        this.playerColor
                    ));
            }
        }
    };

    this.isCompleted = function () {
        return this.snapCount === numberOfPiecesHigh * numberOfPiecesWide - 1;
    };

    this.complete = function () {
        for (var row = 0; row < this.numberOfPiecesHigh; row++) {
            for (var column = 0; column < this.numberOfPiecesWide; column++) {
                this.puzzle[row][column].setBorderColor(null);
            }
        }
    };

    this.update = function () {
        for (var row = 0; row < this.numberOfPiecesHigh; row++) {
            for (var column = 0; column < this.numberOfPiecesWide; column++) {
                this.puzzle[row][column].update();
            }
        }
    };
    this.scatter = function (xmin, xmax, ymin, ymax) {
        ////Random
        for (var row = 0; row < this.numberOfPiecesHigh; row++) {
            for (var column = 0; column < this.numberOfPiecesWide; column++) {
                var randomx = xmin + Math.random() * (xmax - xmin);
                var randomy = ymin + Math.random() * (ymax - ymin);

                var piece = this.puzzle[row][column];
                piece.relocate(randomx, randomy);
            }
        }

        //deterministic
        //for (var row = 0; row < this.numberOfPiecesHigh; row++) {
        //    for (var column = 0; column < this.numberOfPiecesWide; column++) {
        //        var randomx = xmin + (Math.exp(row * column) * 50 + Math.exp(column - row) * 117) % (xmax - xmin);
        //        var randomy = ymin + (Math.exp(row - column) * 202 + Math.exp(column) * 59) % (ymax - ymin);

        //        var piece = this.puzzle[row][column];
        //        piece.relocate(randomx, randomy);
        //    }
        //}
    };
    this.getClickedPiece = function (x, y) {
        for (var row = this.numberOfPiecesHigh - 1; row >= 0; row--) {
            for (var column = this.numberOfPiecesWide - 1; column >= 0; column--) {
                var piece = this.puzzle[row][column];
                if (y > piece.y && y < piece.y + piece.height
                    && x > piece.x && x < piece.x + piece.width) {
                    return piece;
                }
            }
        }
    };
    this.snap = function (pieceToSnap) {
        var xdist = 0;
        var ydist = 0;
        var snapped = false;
        var comparisonPiece = null;
        var snapRange = 15;

        var pieceHolder = pieceToSnap.pieceHolder;

        for (var i = 0; i < pieceHolder.pieces.length; i++) {
            var piece = pieceHolder.pieces[i];

            if (piece.column !== 0) { //if piece isn't far left
                var pieceToLeft = this.puzzle[piece.row][piece.column - 1];
                comparisonPiece = pieceToLeft;
                if (!_.includes(pieceHolder.pieces, pieceToLeft)) {
                    if (Math.abs((pieceToLeft.x + piece.width) - piece.x) < snapRange && Math.abs(pieceToLeft.y - piece.y) < snapRange) {
                        xdist = pieceToLeft.x + piece.width - piece.x;
                        ydist = pieceToLeft.y - piece.y;
                        snapped = true;
                    }
                }
            }
            if (piece.column !== this.numberOfPiecesWide - 1 && !snapped) { //if piece isn't far right
                var pieceToRight = this.puzzle[piece.row][piece.column + 1];
                comparisonPiece = pieceToRight;
                if (!_.includes(pieceHolder.pieces, pieceToRight)) {
                    if (Math.abs((pieceToRight.x - piece.width) - piece.x) < snapRange && Math.abs(pieceToRight.y - piece.y) < snapRange) {
                        xdist = pieceToRight.x - piece.width - piece.x;
                        ydist = pieceToRight.y - piece.y;
                        snapped = true;
                    }
                }
            }

            if (piece.row !== 0 && !snapped) { //if piece isn't top row
                var pieceAbove = this.puzzle[piece.row - 1][piece.column];
                comparisonPiece = pieceAbove;
                if (!_.includes(pieceHolder.pieces, pieceAbove)) {
                    if (Math.abs(pieceAbove.x - piece.x) < snapRange && Math.abs((pieceAbove.y + piece.height) - piece.y) < snapRange) {
                        xdist = pieceAbove.x - piece.x;
                        ydist = pieceAbove.y + piece.height - piece.y;
                        snapped = true;
                    }
                }
            }
            if (piece.row !== this.numberOfPiecesHigh - 1 && !snapped) { //if piece isn't bottom row
                var pieceBelow = this.puzzle[piece.row + 1][piece.column];
                comparisonPiece = pieceBelow;
                if (!_.includes(pieceHolder.pieces, pieceBelow)) {
                    if (Math.abs(pieceBelow.x - piece.x) < snapRange && Math.abs((pieceBelow.y - piece.height) - piece.y) < snapRange) {
                        xdist = pieceBelow.x - piece.x;
                        ydist = pieceBelow.y - piece.height - piece.y;
                        snapped = true;
                    }
                }
            }
            if (snapped) {
                this.snapCount++;
                pieceHolder.move(xdist, ydist);
                piece.pieceHolder.snap(comparisonPiece);
                break;
            }
        }
    };
}