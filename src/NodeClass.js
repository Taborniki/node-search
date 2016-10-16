function Node (parentNode, iconUrl, title) {
    this.parentNode = parentNode;
    this.iconUrl = iconUrl;
    this.title = title;
    this.visual = this.createVisual();
}


// returns the parent Node
Node.prototype.getParentNode = function() {
    return this.parentNode;
};

// creates the visual html node
Node.prototype.createVisual = function() {

    // icon inladen en resizen
    // schaduw rondje inladen

    return this.parentNode;
};
