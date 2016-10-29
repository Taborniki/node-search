var canvas, stage;
var mouseTarget;	// the display object currently under the mouse, or being dragged
var dragStarted;	// indicates whether we are currently in a drag operation
var offset;
var update = true;
var images = [];
var rootNode;

var defaultRectangle = new createjs.Shape();
defaultRectangle.graphics.beginFill("white").drawRect(0, 0, 100, 6); // .beginStroke("red")


$(document).ready(function() {
    init();
});

function init() {

    // create stage and point it to the canvas:
    canvas = document.getElementById("testCanvas");
    stage = new createjs.Stage(canvas);
    // enable touch interactions if supported on the current device:
    createjs.Touch.enable(stage);
    // enabled mouse over / out events
    stage.enableMouseOver(10);
    stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas
    // load the source image:
    var image = new Image();
    image.src = "images/nodes/google.png";
    images.push(image);

    image = new Image();
    image.src = "images/nodes/bbc.png";
    images.push(image);

    image = new Image();
    image.src = "images/nodes/wiki.png";
    images.push(image);
    image.onload = handleImageLoad;

    createTestTree();
    drawTree(rootNode);
}

function createTestTree() {
    // root node 0.1
    rootNode = new Node('none','images/nodes/google.png','world war II');

    // 1.1
    var wikiNode = new Node(rootNode, 'images/nodes/wiki.png','second world war');

    // 1.2
    var wikiNode2 = new Node(rootNode, 'images/nodes/wiki.png','nazi germany');

    // 1.1.1
    var wikiNode3 = new Node(wikiNode, 'images/nodes/wiki.png','first wirld war');

    // 1.1.2
    var bbcNode = new Node(wikiNode, 'images/nodes/bbc.png', 'second world war');
}

function drawTree (node) {

    var posX;
    var posY;

    // in pixels
    var HORIZONTAL_NODE_SPACING = 120;
    var VERTICAL_NODE_SPACING = 120;

    if(node.parentNode == 'none') {
        node.visual.x = 400;
        node.visual.y = 50;
    }
    else {
        numSiblings = node.parentNode.childNodes.length-1;

        if(numSiblings === 0) {
            // right beneath parent node
            node.visual.x = node.parentNode.visual.x;
        }
        else {
            // not straight below parent node
            var childRank = node.parentNode.childNodes.indexOf(node);
            node.visual.x = node.parentNode.visual.x - HORIZONTAL_NODE_SPACING/2*numSiblings + childRank*HORIZONTAL_NODE_SPACING;
        }

        // below parent node
        node.visual.y = node.parentNode.visual.y + VERTICAL_NODE_SPACING;
    }

    // add node to canvas NEED
    stage.addChild(node.visual);

    // draw the child nodes
    for(var i=0; i<node.childNodes.length; i++) {
        drawTree(node.childNodes[i]);
    }
}

function drawLine(pos1, pos2) {
    var line = defaultRectangle.clone(true);
    line.regX = 100/2;
    line.regY = 6/2;
    line.rotation = 45;
    line.x = 500;
    line.y = 200;
    stage.addChild(recto);
}

function handleImageLoad(event) {

    var container = new createjs.Container();
    stage.addChild(container);

    // create and populate the screen with random daisies:
    for (var i = 0; i < 0; i++) { // NEED disabled atm door i<0
        var randindex = Math.floor(Math.random()*images.length);
        var image = images[randindex];
        var bitmap;

        bitmap = new createjs.Bitmap(image);
        //bitmap.shadow = new createjs.Shadow("#a5a5a5", 3, 3, 15);
        container.addChild(bitmap);
        bitmap.x = canvas.width * Math.random() | 0;
        bitmap.y = canvas.height * Math.random() | 0;
        bitmap.regX = bitmap.image.width / 2 | 0;
        bitmap.regY = bitmap.image.height / 2 | 0;
        bitmap.scaleX = bitmap.scaleY = bitmap.scale = Math.random() * 0.4 + 0.6;
        bitmap.name = "bmp_" + i;
        bitmap.cursor = "pointer";
        // using "on" binds the listener to the scope of the currentTarget by default
        // in this case that means it executes in the scope of the button.
        bitmap.on("mousedown", function (evt) {
            this.parent.addChild(this);
            this.offset = {x: this.x - evt.stageX, y: this.y - evt.stageY};
        });
        // the pressmove event is dispatched when the mouse moves after a mousedown on the target until the mouse is released.
        bitmap.on("pressmove", function (evt) {
            this.x = evt.stageX + this.offset.x;
            this.y = evt.stageY + this.offset.y;
            // indicate that the stage should be updated on the next tick:
            update = true;
        });
        bitmap.on("rollover", function (evt) {
            this.scaleX = this.scaleY = this.scale * 1.2;
            update = true;
        });
        bitmap.on("rollout", function (evt) {
            this.scaleX = this.scaleY = this.scale;
            update = true;
        });
    }

    // rectangle test
    var recto = defaultRectangle.clone(true);
    recto.regX = 100/2;
    recto.regY = 6/2;
    recto.rotation = 45;
    recto.x = 500;
    recto.y = 200;
    stage.addChild(recto);

    createjs.Ticker.addEventListener("tick", tick);
}
function tick(event) {
    // this set makes it so the stage only re-renders when an event handler indicates a change has happened.
    if (update) {
        update = true; // only update once
        stage.update(event);
    }
}
