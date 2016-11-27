var MENU_OFFSET_X = -85;
var MENU_OFFSET_Y = -15; // NEED moet gewoon het centrum zijn
var ROLLOUT_DELAY_TIME = 200; // in milliseconds
var COLLAPSE_CTR_POS_X = 60;
var COLLAPSE_CTR_POS_Y = 52;

function Node (parentNode, iconUrl, title) {
    this.parentNode = parentNode;
    this.iconUrl = iconUrl;
    this.backgroundUrl = 'images/nodes/background.png';
    this.title = title;
    this.visual = this.createVisual();
    this.childNodes = [];
    this.contextMenu = new ContextMenu(this);
    this.noRollout = false;

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
    // collapse counter
    image = new Image();
    image.src = 'images/nodes/collapsecounter.png';
    var blueCircle = new createjs.Bitmap(image);
    var collapseCounterContainer = new createjs.Container();
    collapseCounterContainer.addChild(blueCircle);
    var collapseCounterText = new createjs.Text(3, "20px Arial", "white"); // NEED 1 moet echte count worden
    collapseCounterText.x = 7;
    collapseCounterText.y = 2;
    collapseCounterContainer.addChild(collapseCounterText);
    collapseCounterContainer.x = COLLAPSE_CTR_POS_X;
    collapseCounterContainer.y = COLLAPSE_CTR_POS_Y;
    collapseCounterContainer.visible = false;
    container.addChild(collapseCounterContainer);
    container.setChildIndex(collapseCounterContainer,2); // z-index to top, z-index can't be larger then container.children.length-1

    container.addChild(background);
    container.setChildIndex(background,0);
    container.addChild(icon);
    container.setChildIndex(icon,1);

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

    // exit hoover
    container.on("rollout", function (evt) {
        backupThis.removeFocusAnimation();
    });

    return container;
};

// animates the loss of focus
Node.prototype.removeFocusAnimation = function() {
    var backupThis = this;

    // delay rollout
    setTimeout(function(){
        // other objects have ROLLOUT_DELAY_TIME milliseconds to set the noRollout using interruptRollout()
        if(!backupThis.noRollout) {
            // make smaller
            var tween = createjs.Tween.get(backupThis.visual, {loop: false})
                .to({scaleX: 0.8, scaleY: 0.8}, 100, createjs.Ease.quartInOut);

            var background = backupThis.visual.children[0];

            // remove shadow
            createjs.Tween.get(background.shadow, {loop:false})
                .to({blur:0}, 200, createjs.Ease.quartInOut);

            // hide context menu
            backupThis.contextMenu.hide();

            update = true;
        }
    }, ROLLOUT_DELAY_TIME);
};

// sets the location of the node (x,y)
Node.prototype.setLocation = function(x,y) {
    this.visual.x = x;
    this.visual.y = y;

    this.contextMenu.setLocation(x + MENU_OFFSET_X, y + MENU_OFFSET_Y);
};
// interrupts the rollout event
Node.prototype.interruptRollout = function() {
    this.noRollout = true;
};

// launches a rollout event
Node.prototype.launchRollout = function() {
    this.noRollout = false;
    this.removeFocusAnimation();
};

// collapses all the child nodes and their children...
Node.prototype.collapseChildren = function(nodeToCollapseTo) {
    // will go recursively down the tree
    for(var i=0; i<this.childNodes.length; i++) {
        this.childNodes[i].collapseChildren(nodeToCollapseTo);
    }

    // animate posisiton of the current node to the position of the nodeToCollapseTo
    createjs.Tween.get(this.visual, {loop: false}).to({x : nodeToCollapseTo.visual.x, y : nodeToCollapseTo.visual.y}, 100);

    // set collapseCounter visible
    var numCollapsed = this.getNumChildrenRecursive();
    if (numCollapsed > 0) {
        // set label value NEED
        this.visual.children[2].visible = true; // show label
    }


    // NEED disable menu + set z-index to lower than nodeToCollapseTo + remeber old position to go back later + delete rods + boolean of hij de collapsencounter moet tonen
}

// gets the total children and grandchildren and grand grand .... recursively
Node.prototype.getNumChildrenRecursive = function() {
    var count = 0;
    for(var i=0; i<this.childNodes.length; i++) {
        count += this.childNodes[i].getNumChildrenRecursive() + 1; // +1 is for the examined node itself
    }
    return count;
}

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
