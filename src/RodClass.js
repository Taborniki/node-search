var ROD_WIDTH = 6;

function Rod (topNode, botNode) {
    this.topNode = topNode;
    this.botNode = botNode;
    this.visual = this.createVisual();
}

// creates the visual html node
Rod.prototype.createVisual = function() {
    var visual = new createjs.Shape();
    return visual;
};

// draws the rod
Rod.prototype.draw = function() {
    // begin drawing
    this.visual.graphics.setStrokeStyle(ROD_WIDTH).beginStroke("white");
    // move to starting point
    this.visual.graphics.moveTo(this.topNode.visual.x, this.topNode.visual.y);
    // draw line
    this.visual.graphics.lineTo(this.botNode.visual.x, this.botNode.visual.y);
    // end drawing
    this.visual.graphics.endStroke();
}
