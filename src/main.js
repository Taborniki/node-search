var canvas, stage;
var mouseTarget;	// the display object currently under the mouse, or being dragged
var dragStarted;	// indicates whether we are currently in a drag operation
var offset;
var update = true;
var images = [];
var rootNode;

$(document).ready(function() {
    init();
});

function init() {

    // create stage and point it to the canvas:
    canvas = document.getElementById("main-canvas");
    stage = new createjs.Stage(canvas);
    // enable touch interactions if supported on the current device:
    createjs.Touch.enable(stage);
    // enabled mouse over / out events
    stage.enableMouseOver(10);
    stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas


    createTestTree();
    drawTree(rootNode);
    createjs.Ticker.addEventListener("tick", tick);
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

    // 1.1.2.1
    var bbcNode2 = new Node(bbcNode, 'images/nodes/bbc.png', 'cold war');
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

        // draw connecting rod
        var rod = new Rod(node.parentNode, node);
        stage.addChild(rod.visual);
        // send to back (z-index)
        stage.setChildIndex(rod.visual,0);
    }

    // add node to canvas NEED
    stage.addChild(node.visual);

    // draw the child nodes
    for(var i=0; i<node.childNodes.length; i++) {
        drawTree(node.childNodes[i]);
    }
}

function tick(event) {
    // this set makes it so the stage only re-renders when an event handler indicates a change has happened.
    if (update) {
        update = true; // only update once
        stage.update(event);
    }
}
