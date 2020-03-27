function puzzlePieceHolder(piece) {
    this.pieces = [];
    this.pieces.push(piece);

    this.move = function (xdist, ydist) {
        _.each(this.pieces, function (piece) {
            piece.relocate(piece.x + xdist, piece.y + ydist);
        });
    };
    this.snap = function (pieceToJoin) {
        for (var i = 0; i < pieceToJoin.pieceHolder.pieces.length; i++) {
            var groupedPiece = pieceToJoin.pieceHolder.pieces[i];
            if (pieceToJoin !== groupedPiece) {
                groupedPiece.pieceHolder = this;
                this.pieces.push(groupedPiece);
            }
        }

        pieceToJoin.pieceHolder = this;
        this.pieces.push(pieceToJoin);
    };
    this.setBorderColor = function (color) {
        _.each(this.pieces, function (piece) {
            piece.borderColor = color;
        });
    };
}
