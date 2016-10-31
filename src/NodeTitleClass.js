function NodeTitle (hostNode) {
    this.hostNode = hostNode;
    this.visual = this.createVisual();
}

// creates the visual html node
NodeTitle.prototype.createVisual = function() {

    var visual = new createjs.Text(this.hostNode.title, "20px Arial", "#545454");
    visual.x = this.hostNode.visual.x + 30;
    visual.y = this.hostNode.visual.y - 12;

    return visual;
};
