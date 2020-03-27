function gameArea(canvasId, refreshInterval) {
    this.canvas = document.getElementById(canvasId);
    this.components = [];

    this.start = function () {
        this.context = this.canvas.getContext("2d");
        this.frameNo = 0;
        this.interval = setInterval(this.updateGameArea, refreshInterval, this);
    };

    this.clear = function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };

    this.addComponent = function (component) {
        this.components.push(component);
    };

    this.updateGameArea = function (thisGameArea) {
        thisGameArea.clear();
        for (var i = 0; i < thisGameArea.components.length; i++) {
            thisGameArea.components[0].update();
        }
    };

    this.endGame = function () {
        this.updateGameArea(this);
        clearInterval(this.interval);
    };
}