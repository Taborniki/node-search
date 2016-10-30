function Rod (topNode, botNode) {
    this.topNode = topNode;
    this.botNode = botNode;
    this.visual = this.createVisual();
}

// creates the visual html node
Rod.prototype.createVisual = function() {

    var WIDTH = 6;

    var visual = new createjs.Shape();

    // begin drawing
    visual.graphics.setStrokeStyle(WIDTH).beginStroke("white");

    // move to starting point
    visual.graphics.moveTo(this.topNode.visual.x, this.topNode.visual.y);
    
    // draw line
    visual.graphics.lineTo(this.botNode.visual.x, this.botNode.visual.y);

    // end drawing
    visual.graphics.endStroke();

    return visual;
};
