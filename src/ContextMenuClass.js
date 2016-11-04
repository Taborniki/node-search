function ContextMenu (hostNode) {
    this.hostNode = hostNode;
    this.visual = this.createVisual(['delete','collapse']);
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
        allChildren[i].visible = true;
    }
};

ContextMenu.prototype.hide = function() {
    var allChildren = this.visual.children;
    for(var i=0; i<allChildren.length; i++) {
        allChildren[i].visible = false;
    }
};
