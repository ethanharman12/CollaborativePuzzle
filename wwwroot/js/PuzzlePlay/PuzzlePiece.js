function puzzlePiece(
    gameArea,
    image,
    row,
    column,
    width,
    height,
    x,
    y,
    imageHeight,
    imageWidth
) {
    this.width = width;
    this.height = height;
    this.row = row;
    this.column = column;
    this.x = x;
    this.y = y;
    this.imageHeight = imageHeight;
    this.imageWidth = imageWidth;
    this.pieceHolder = new puzzlePieceHolder(this);

    this.borderColor = "#A7A2A1";

    this.update = function () {
        ctx = gameArea.context;

        ctx.drawImage(
            image,
            this.column * this.imageWidth, //image x
            this.row * this.imageHeight, //image y
            this.imageWidth, //image width
            this.imageHeight, //image height
            this.x, //canvas x
            this.y, //canvas y
            this.width, //canvas width
            this.height); //canvas height

        if (this.borderColor) {
            ctx.beginPath();
            ctx.lineWidth = "2";
            ctx.strokeStyle = this.borderColor;
            ctx.rect(
                this.x,
                this.y,
                this.width,
                this.height);
            ctx.stroke();
        }
    };
    this.move = function (x, y) {
        this.pieceHolder.move(x - this.x, y - this.y);
    };
    this.relocate = function (x, y) {
        this.x = x;
        this.y = y;
    };
    this.setBorderColor = function (color) {
        //this.borderColor = color;
        this.pieceHolder.setBorderColor(color);
    };
}