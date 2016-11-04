var MENU_OFFSET_X = -70;
var MENU_OFFSET_Y = -15; // NEED moet gewoon het centrum zijn

function Node (parentNode, iconUrl, title) {
    this.parentNode = parentNode;
    this.iconUrl = iconUrl;
    this.backgroundUrl = 'images/nodes/background.png';
    this.title = title;
    this.visual = this.createVisual();
    this.childNodes = [];
    this.contextMenu = new ContextMenu(this);

    // add this node as a child to the parentNode
    if(parentNode != 'none') {
        parentNode.addChild(this);
    }
}

// adds a child node
Node.prototype.addChild = function(childNode) {
    this.childNodes.push(childNode);
};

// creates the visual html node
Node.prototype.createVisual = function() {

    var container = new createjs.Container();

    var image = new Image();
    image.src = this.iconUrl;
    var icon = new createjs.Bitmap(image);
    image = new Image();
    image.src = this.backgroundUrl;
    var background = new createjs.Bitmap(image);
    container.addChild(background);
    container.addChild(icon);

    // TODO nodig?
    //$(icon.image).on('load', function() {
    //});
    var targetDimensions = 40;
    var currentDimensions = Math.max(icon.image.height, icon.image.width);
    icon.scaleX = targetDimensions/currentDimensions;
    icon.scaleY = targetDimensions/currentDimensions;

    // move logo to center of backgrounds
    // (container size - logo size)/2
    var contSize = container.getBounds();
    icon.x = (contSize.width - icon.image.width*icon.scaleX)/2;
    icon.y = (contSize.height - icon.image.height*icon.scaleY)/2;

    container.regX = background.image.width / 2;
    container.regY = background.image.height / 2;
    container.scaleX = container.scaleY = container.scale = 0.8;

    // shadow, no offsets, 0 blur (= invisible)
    background.shadow = new createjs.Shadow("#0094FF", 0, 0, 0);

    var backupThis = this;

    // hover animation
    container.on("rollover", function (evt) {
        // enlarge
        createjs.Tween.get(this, {loop: false})
            .to({scaleX: 1, scaleY: 1}, 200, createjs.Ease.quartInOut);
        // add shadow
        createjs.Tween.get(background.shadow, {loop:false})
            .to({blur:15}, 200, createjs.Ease.quartInOut);

        // launch context menu
        backupThis.contextMenu.show();

        update = true;
    });

    container.on("rollout", function (evt) {
        // make smaller
        var tween = createjs.Tween.get(this, {loop: false})
            .to({scaleX: 0.8, scaleY: 0.8}, 100, createjs.Ease.quartInOut);
        // remove shadow
        createjs.Tween.get(background.shadow, {loop:false})
            .to({blur:0}, 200, createjs.Ease.quartInOut);

        // hide context menu
        backupThis.contextMenu.hide();

        update = true;
    });

    return container;
};

// sets the location of the node (x,y)
Node.prototype.setLocation = function(x,y) {
    this.visual.x = x;
    this.visual.y = y;

    this.contextMenu.setLocation(x + MENU_OFFSET_X, y + MENU_OFFSET_Y);
};

// measures the distance to an other node
Node.prototype.distance = function(otherNode) {
    return Math.sqrt(Math.abs(this.visual.x - otherNode.visual.x)^2 + Math.abs(this.visual.y - otherNode.visual.y)^2);
};

// measures the angle between the connecting line with an other node and the horizontal reference
Node.prototype.angle = function(otherNode) {
    var yDiff = this.visual.y - otherNode.visual.y;
    var xDiff = this.visual.x - otherNode.visual.x;
    var angleRad = Math.atan(yDiff/xDiff);
    return angleRad * 180 / Math.PI;
};
