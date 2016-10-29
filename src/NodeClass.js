function Node (parentNode, iconUrl, title) {
    this.parentNode = parentNode;
    this.iconUrl = iconUrl;
    this.title = title;
    this.visual = this.createVisual();
    this.childNodes = [];

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

    // NEED icon inladen en resizen
    // NEED schaduwig rondje inladen
    var image = new Image();
    image.src = this.iconUrl;
    var bitmap = new createjs.Bitmap(image);

    bitmap.regX = bitmap.image.width / 2;
    bitmap.regY = bitmap.image.height / 2;
    bitmap.scaleX = bitmap.scaleY = bitmap.scale = 0.8;

    // shadow
    bitmap.shadow = new createjs.Shadow("#0094FF", 0,0, 0);

    // hover animation
    bitmap.on("mouseover", function (evt) {
        // enlarge
        createjs.Tween.get(this, {loop: false})
            .to({scaleX: 1, scaleY: 1}, 200, createjs.Ease.quartInOut);
        // add shadow
        createjs.Tween.get(this.shadow, {loop:false})
            .to({blur:15}, 200, createjs.Ease.quartInOut);


        update = true;
    });
    bitmap.on("rollout", function (evt) {
        // make smaller
        var tween = createjs.Tween.get(this, {loop: false})
            .to({scaleX: 0.8, scaleY: 0.8}, 100, createjs.Ease.quartInOut);
        // remove shadow
        createjs.Tween.get(this.shadow, {loop:false})
            .to({blur:0}, 200, createjs.Ease.quartInOut);    

        update = true;
    });

    return bitmap;
};
