var X_OFFSET_TITLE = 40;
var Y_OFFSET_TITLE = -12;

function NodeTitle (hostNode) {
    this.hostNode = hostNode;
    this.visual = this.createVisual();
}

// creates the visual html node
NodeTitle.prototype.createVisual = function() {

    // max number of characters TODO dependent on maxWidth (see below)
    var titleToPrint = this.hostNode.title.substring(0,30);
    // wrap lines TODO dependent on maxWidth (see below)
    titleToPrint = titleToPrint.replace(/(.{15})/g, "$1\n");
    var visual = new createjs.Text(titleToPrint, "20px Arial", "#545454");
    // limit text width to 60% of internode space
    visual.maxWidth = DEFAULT_X_NODE_SPACING*0.6; // TODO moet ook megaan met reduceFactor bij Node
    return visual;
};

// sets the location of the text
NodeTitle.prototype.setLocation = function(x,y) {
    this.visual.x = x + X_OFFSET_TITLE;
    this.visual.y = y + Y_OFFSET_TITLE;
}
