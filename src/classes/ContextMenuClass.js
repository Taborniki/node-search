var ROTATION_ANGLE_MENU = 30;
// TODO moeten gewoon midden van node zijn
var X_OFFSET_MENU = -85;
var Y_OFFSET_MENU = -15;

function ContextMenu (hostNode,actionList) {
    this.hostNode = hostNode;
    this.actionList = actionList;
    this.visual = this.createVisual();
}

// creates the visual html node
ContextMenu.prototype.createVisual = function() {
    var container = new createjs.Container();

    // iterate menu items
    for(var i=0; i<this.actionList.length; i++) {
        var image = new Image();
        image.src = 'images/menu/' + this.actionList[i] + '.png';
        var bitmap = new createjs.Bitmap(image);
        bitmap.visible = false;

        // set good for rotation
        // TODO zijn gerelateerd aan positie van menu tov node
        bitmap.regX = 100;
        bitmap.regY = 15;
        bitmap.x = bitmap.regX;
        bitmap.y = bitmap.regY;

        var backupThis = this;

        // set events for bitmap
        bitmap.on("rollover", function (evt) {
            // interrupt rollout of parent node
            backupThis.hostNode.interruptRollout();
        });

        bitmap.on("rollout", function (evt) {
            // launch rollout of parent node
            backupThis.hostNode.launchRollout();
        });

        // TODO closure troubles
        // lees: https://developer.mozilla.org/en/docs/Web/JavaScript/Closures#Creating_closures_in_loops_A_common_mistake
        // lees: http://stackoverflow.com/questions/111102/how-do-javascript-closures-work?rq=1
        (function() {
            var action = backupThis.actionList[i];
            bitmap.on("click", function(evt) {
                backupThis.executeAction(action);
            });
        })();

        // set cursor to 'hand' on hoover
        container.cursor = 'pointer';

        container.addChild(bitmap);
    }

    return container;
};

// sets the location of the node (x,y)
ContextMenu.prototype.setLocation = function(x,y) {
    this.visual.x = x + X_OFFSET_MENU;
    this.visual.y = y + Y_OFFSET_MENU;
};

ContextMenu.prototype.show = function() {
    var allChildren = this.visual.children;
    for(var i=0; i<allChildren.length; i++) {
        var child = allChildren[i];
        child.visible = true;

        // animate
        createjs.Tween.get(child, {loop: false}).to({rotation: i*ROTATION_ANGLE_MENU}, 100);
    }
};

ContextMenu.prototype.hide = function() {
    var allChildren = this.visual.children;
    for(var i=0; i<allChildren.length; i++) {
        var child = allChildren[i];

        // disappear suddenly
        child.visible = false;

        // reset rotation
        child.rotation = 0;

        // animate disappearance
        // createjs.Tween.get(child, {loop: false}).to({rotation: 0}, 100).to({visible:false}, 100);
    }
};

// executes the action, triggered on click of a menu item
// currently supported actions: collapse, delete, finish
// nothing is done if the action is not supported
ContextMenu.prototype.executeAction = function(action) {
    if (action == 'collapse')
        this.hostNode.collapseChildren(this.hostNode, true);
    else if (action == 'delete')
        this.hostNode.delete();
    else if (action == 'finish')
        this.hostNode.finish();
};
