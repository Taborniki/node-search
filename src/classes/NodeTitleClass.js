var X_OFFSET_TITLE = 40;
var Y_OFFSET_TITLE = -12;

function NodeTitle (hostNode) {
    this.hostNode = hostNode;
    this.visual = this.createVisual();
}

// creates the visual html node
NodeTitle.prototype.createVisual = function() {
    // NEED text.maxWidth = inter node distance stellen;
    // NEED text string opsplitsen in stukjes van n characters door '\n' ertussen te voegen
    // NEED fiddle https://jsfiddle.net/JTqvJ/302/
    var visual = new createjs.Text(this.hostNode.title, "20px Arial", "#545454");
    return visual;
};

// sets the location of the text
NodeTitle.prototype.setLocation = function(x,y) {
    this.visual.x = x + X_OFFSET_TITLE;
    this.visual.y = y + Y_OFFSET_TITLE;
}
