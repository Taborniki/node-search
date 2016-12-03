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
    this.titleText = new NodeTitle(this);
    this.noRollout = false;
    this.stage = {};
    this.collapsed = false;
    this.hasParentNode = (parentNode !== 'none');
    console.log(this.hasParentNode);
    if (this.hasParentNode)
        parentNode.addChild(this); // add as a child to the parent node
        this.rod = new Rod(this.parentNode, this); // draw connecting rod
}

// assign the stage object to the node
Node.prototype.assignStage = function(stageObject) {
    // save stage object for later use
    this.stage = stageObject;
    // add node to stage
    stageObject.addChild(this.visual);
    // add menu to node
    stageObject.addChild(this.contextMenu.visual);
    // add text to node
    stageObject.addChild(this.titleText.visual);
    // create connecting rod with hostNode if it exists
    if (this.hasParentNode) {
        stageObject.addChild(this.rod.visual);
        stageObject.setChildIndex(this.rod.visual,0); // send to back (z-index)
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
    var collapseCounterText = new createjs.Text(1, "20px Arial", "white");
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

    this.contextMenu.setLocation(x,y);
    this.titleText.setLocation(x,y);
    if (this.hasParentNode)
        this.rod.draw();
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
Node.prototype.collapseChildren = function(nodeToCollapseTo, isCollapseStart) {
    // will go recursively down the tree
    for(var i=0; i<this.childNodes.length; i++) {
        this.childNodes[i].collapseChildren(nodeToCollapseTo, false);
    }

    // animate posisiton of the current node to the position of the nodeToCollapseTo
    createjs.Tween.get(this.visual, {loop: false}).to({x : nodeToCollapseTo.visual.x, y : nodeToCollapseTo.visual.y}, 100);

    // set collapseCounter visible
    var numCollapsed = this.getNumChildrenRecursive();
    if (isCollapseStart && numCollapsed > 0) {
        this.visual.children[2].children[1].text = numCollapsed;
        this.visual.children[2].visible = true; // show label
        // set z-index to top
        this.stage.setChildIndex(this.visual,this.stage.children.length-1);

        // set collapsed var to true
        // this is needed to stop decollapsing when a higher node is decollapsed
        this.collapsed = true;
    }
    else {
        // hide label if it was already shown due to earlier collapsing
        this.visual.children[2].visible = false;
        // NEED this.visible functie of zo die dat netjes doet
        // set rod invisible
        this.rod.visual.visible = false;
        // set title text invisible
        this.titleText.visual.visible = false;
    }

    // NEED remember old position to go back later -> NIET NODIG: je kunt gewoon opnieuw draw doen -> drawTree functie verplaatsen naar node ipv in main js
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
