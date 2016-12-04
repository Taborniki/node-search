var canvas, stage;
var mouseTarget;	// the display object currently under the mouse, or being dragged
var dragStarted;	// indicates whether we are currently in a drag operation
var offset;
var update = true;
var images = [];
var rootNode;

$(document).ready(function() {
    init();

    // NEED test
    $('#btnTestTab').on('click', function() {
        console.log('clicked btn');
        chrome.tabs.create({ url: 'http://terra.snellman.net' }, function(tab) {
            // callback function
            console.log(tab.id);

            // wait for tab to load
            chrome.tabs.onUpdated.addListener(function(tabId , info) {
                if (tabId == tab.id && info.status == "complete") {
                    // send message to hook link tags
                    chrome.tabs.sendMessage(tab.id, 'attach-hook');
                }
            });
        });
    });

    // NEED test
    // listen for incoming messages
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    	console.log(message);
        console.log(sender);
    });
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

    // ticker
    createjs.Ticker.addEventListener("tick", tick);
    createjs.Ticker.framerate = 60;
}

function createTestTree() {
    // root node 0.1
    rootNode = new Node('none','images/nodes/google.ico','world war II');

    // 1.1
    var wikiNode = new Node(rootNode, 'images/nodes/wiki.ico','second world war');

    // 1.2
    var wikiNode2 = new Node(rootNode, 'images/nodes/wiki.ico','nazi germany');

    // 1.1.1
    var wikiNode3 = new Node(wikiNode, 'images/nodes/wiki.ico','first world war');

    // 1.1.2
    var bbcNode = new Node(wikiNode, 'images/nodes/asana.ico', '2nd world war');

    // 1.1.2.1
    var bbcNode2 = new Node(bbcNode, 'images/nodes/bbc.ico', 'cold war');
}

function drawTree (node) {

    var posX;
    var posY;

    // in pixels
    var HORIZONTAL_NODE_SPACING = 300;
    var VERTICAL_NODE_SPACING = 120;

    if(node.parentNode == 'none') {
        // location of top node (x,y)
        node.setLocation(600,100);
    }
    else {
        numSiblings = node.parentNode.childNodes.length-1;
        var xToSet;

        if(numSiblings === 0) {
            // right beneath parent node
            xToSet = node.parentNode.visual.x;
        }
        else {
            // not straight below parent node
            var childRank = node.parentNode.childNodes.indexOf(node);
            xToSet = node.parentNode.visual.x - HORIZONTAL_NODE_SPACING/2*numSiblings + childRank*HORIZONTAL_NODE_SPACING;
        }

        // below parent node
        var yToSet = node.parentNode.visual.y + VERTICAL_NODE_SPACING;

        node.setLocation(xToSet,yToSet);
    }

    // add node to canvas
    node.assignStage(stage);

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
