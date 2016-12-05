var canvas, stage;
var mouseTarget;	// the display object currently under the mouse, or being dragged
var dragStarted;	// indicates whether we are currently in a drag operation
var offset;
var update = true;
var images = [];
var rootNode;
var tabManager;

$(document).ready(function() {
    //init();
    init();
});


function init() {
    // create stage and point it to the canvas:
    canvas = document.getElementById("main-canvas");
    stage = new createjs.Stage(canvas);

    // enabled mouse over / out events
    stage.enableMouseOver(10);
    stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas

    // NEED moet google worden + subNode(s) verwijderen
    rootNode = new Node('none','images/nodes/google.ico','Terra Home','http://terra.snellman.net');
    var subNode1 = new Node(rootNode, 'images/nodes/wiki.ico','Help1','http://terra.snellman.net/usage/');
    var subNode2 = new Node(subNode1, 'images/nodes/wiki.ico','Help2','http://terra.snellman.net/usage/');
    var subNode3 = new Node(subNode1, 'images/nodes/wiki.ico','Help3','http://terra.snellman.net/usage/');
    var subNode4 = new Node(subNode1, 'images/nodes/wiki.ico','Help4','http://terra.snellman.net/usage/');

    rootNode.assignStage(stage); // add node to canvas
    rootNode.setLocation(600,100); // NEED dynamisch tov grootte canvas

    // create TabManager
    tabManager = new TabManager(rootNode);
    tabManager.initMessageListener();

    // ticker
    createjs.Ticker.addEventListener("tick", tick);
    createjs.Ticker.framerate = 60;
}

function tick(event) {
    // this set makes it so the stage only re-renders when an event handler indicates a change has happened.
    if (update) {
        update = true; // only update once
        stage.update(event);
    }
}
