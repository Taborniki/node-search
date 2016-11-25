var ROTATION_ANGLE = 30;

function ContextMenu (hostNode) {
    this.hostNode = hostNode;
    this.visual = this.createVisual(['delete','collapse','target','arrow']);
}

// creates the visual html node
ContextMenu.prototype.createVisual = function(menuItems) {
    var container = new createjs.Container();

    // iterate menu items
    for(var i=0; i<menuItems.length; i++) {
        var image = new Image();
        image.src = 'images/menu/' + menuItems[i] + '.png';
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

        bitmap.on("click", function(evt) {
            // NEED different functions voor different children
            backupThis.hostNode.collapseChildren(backupThis.hostNode);
        });

        container.addChild(bitmap);
    }

    return container;
};

// sets the location of the node (x,y)
ContextMenu.prototype.setLocation = function(x,y) {
    this.visual.x = x;
    this.visual.y = y;
};

ContextMenu.prototype.show = function() {
    var allChildren = this.visual.children;
    for(var i=0; i<allChildren.length; i++) {
        var child = allChildren[i];
        child.visible = true;

        // animate
        createjs.Tween.get(child, {loop: false}).to({rotation: i*ROTATION_ANGLE}, 100);
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
