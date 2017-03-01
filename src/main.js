/*Copyright (c) 2013-2016, Rob Schmuecker
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* The name Rob Schmuecker may not be used to endorse or promote products
  derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL MICHAEL BOSTOCK BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.*/


//. NEED-ADAPT naar d3 v4

// Get JSON data
treeJSON = d3.json("flare-tiny.json", function(error, treeData) {

    // Calculate total nodes, max label length
    var totalNodes = 0;
    var maxLabelLength = 0;
    // variables for drag/drop
    var selectedNode = null;
    var draggingNode = null;
    // panning variables
    var panSpeed = 200;
    var panBoundary = 20; // Within 20px from edges will pan when dragging.
    // Misc. variables
    var i = 0;
    var duration = 300; // [ms] animation durations
    var root;

    // size of the diagram
    var viewerWidth = $(document).width();
    var viewerHeight = $(document).height();

    var tree = d3.layout.tree()
        .size([viewerHeight, viewerWidth]);

    // define a d3 diagonal projection for use by the node paths later on.
    var diagonal = d3.svg.diagonal()
        .projection(function(d) {
            return [d.y, d.x];
        });

    // create tabManager object
    var tabManager = new TabManager();

    // A recursive helper function for performing some setup by walking through all nodes
    function visit(parent, visitFn, childrenFn) {
        if (!parent) return;

        visitFn(parent);

        var children = childrenFn(parent);
        if (children) {
            var count = children.length;
            for (var i = 0; i < count; i++) {
                visit(children[i], visitFn, childrenFn);
            }
        }
    }

    // Call visit function to establish maxLabelLength
    visit(treeData, function(d) {
        totalNodes++;
        maxLabelLength = Math.max(d.name.length, maxLabelLength);

    }, function(d) {
        return d.children && d.children.length > 0 ? d.children : null;
    });

    // TODO: Pan function, can be better implemented.

    function pan(domNode, direction) {
        var speed = panSpeed;
        if (panTimer) {
            clearTimeout(panTimer);
            translateCoords = d3.transform(svgGroup.attr("transform"));
            if (direction == 'left' || direction == 'right') {
                translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
                translateY = translateCoords.translate[1];
            } else if (direction == 'up' || direction == 'down') {
                translateX = translateCoords.translate[0];
                translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
            }
            scaleX = translateCoords.scale[0];
            scaleY = translateCoords.scale[1];
            scale = zoomListener.scale();
            svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
            d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
            zoomListener.scale(zoomListener.scale());
            zoomListener.translate([translateX, translateY]);
            panTimer = setTimeout(function() {
                pan(domNode, speed, direction);
            }, 50);
        }
    }

    // Define the zoom function for the zoomable tree

    function zoom() {
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }


    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

    // define the baseSvg, attaching a class for styling and the zoomListener
    var baseSvg = d3.select("#tree-container").append("svg")
        .attr("width", viewerWidth)
        .attr("height", viewerHeight)
        .attr("class", "overlay")
        .call(zoomListener);



    // Helper functions for collapsing and expanding nodes.

    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    function expand(d) {
        if (d._children) {
            d.children = d._children;
            d.children.forEach(expand);
            d._children = null;
        }
    }

    var overCircle = function(d) {
        selectedNode = d;
        updateTempConnector();
    };
    var outCircle = function(d) {
        selectedNode = null;
        updateTempConnector();
    };

    // Function to update the temporary connector indicating dragging affiliation
    var updateTempConnector = function() {
        var data = [];
        if (draggingNode !== null && selectedNode !== null) {
            // have to flip the source coordinates since we did this for the existing connectors on the original tree
            data = [{
                source: {
                    x: selectedNode.y0,
                    y: selectedNode.x0
                },
                target: {
                    x: draggingNode.y0,
                    y: draggingNode.x0
                }
            }];
        }
        var link = svgGroup.selectAll(".templink").data(data);

        link.enter().append("path")
            .attr("class", "templink")
            .attr("d", d3.svg.diagonal())
            .attr('pointer-events', 'none');

        link.attr("d", d3.svg.diagonal());

        link.exit().remove();
    };

    // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.

    function centerNode(source) {
        scale = zoomListener.scale();
        x = -source.y0;
        y = -source.x0;
        x = x * scale + viewerWidth / 2;
        y = y * scale + viewerHeight / 2;
        d3.select('g').transition()
            .duration(duration)
            .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
        zoomListener.scale(scale);
        zoomListener.translate([x, y]);
    }

    // Toggle children function

    function toggleChildren(d, nodeHtml) {
        if (d.children) { //. has not yet collapsed children
            updateChildCountIndicator(nodeHtml, d);
            d._children = d.children; //. collapse them
            d.children = null;
        } else if (d._children) { //. has collapsed children
            d.children = d._children; //. expand them
            d._children = null;

            //. for all children, updated there labels if they are collapsed themselves
            for (var i=0; i<d.children.length; i++) {
                var nodeData = d.children[i];
                var nodeHtml = document.getElementById("#node-" + nodeData.id);
                updateChildCountIndicator(nodeHtml, nodeData);
            }
        }
        //. nothing happens is node has no children
        return d;
    }

    //. updates the number displayed in the child count indicator

    function updateChildCountIndicator(nodeHtml, nodeData) {
        //. get number of children recursively
        var numChildren = countChildrenRecursively(nodeData);

        //. convert to string
        if (numChildren<100)
            var numChildrenText = numChildren.toString()
        else
            var numChildrenText = "99+";

        d3.select(nodeHtml).selectAll("text.node-child-counter-element").text(numChildrenText);
    }

    //. counts the number of children of a node recursively
    //. the current node is excluded from the count

    function countChildrenRecursively (nodeData) {
        var numChildren = 0;

        if (nodeData.children) {
            //. not hidden children
            for (var i=0; i<nodeData.children.length; i++) {
                numChildren += 1 + countChildrenRecursively(nodeData.children[i]);
            }
        }
        else if (nodeData._children) {
            //. hidden children
            for (var i=0; i<nodeData._children.length; i++) {
                numChildren += 1 + countChildrenRecursively(nodeData._children[i]);
            }
        }

        return numChildren;
    }

    // Toggle children on click.
    function clickToggle(d,nodeDOM) {
        if (d3.event.defaultPrevented) return; // click suppressed
        d = toggleChildren(d,nodeDOM);
        update(d);
        centerNode(d); // NEED remove?
    }

    //. delete node, removes children too!
    function deleteNode(nodeData) {
        if (d3.event.defaultPrevented) return; // click suppressed
        // remove node from the list of children in it's parent node
        var index = nodeData.parent.children.indexOf(nodeData);
        nodeData.parent.children.splice(index, 1);
        update(nodeData.parent);
    }

    //. finish node
    function finishNode(nodeData) {
        if (d3.event.defaultPrevented) return; // click suppressed
        // move children to parent node NEED ook _children doen voor als node zou collapsed zijn
        var index = nodeData.parent.children.indexOf(nodeData);
        for (var i = nodeData.children.length-1; i >= 0; i--) {
            nodeData.parent.children.splice(index, 0, nodeData.children[i]);
        }
        // delete current node
        deleteNode(nodeData);
    }

    //. open node website in new tab
    function openNodeInTab(nodeData) {
        tabManager.openPage(nodeData.url,nodeData,addNode);
    }

    // add a node to the tree
    function addNode(parentNode, title, url, iconUrl) {
        // NEED nog oplossen voor indien collapsed : _children
        if (!('children' in parentNode)) {
            parentNode.children = [];
        }

        if (title == '<No title>')
            title = ''

        parentNode.children.push({
            'name' : cropTitle(parentNode, title),
            'url' : url,
            'iconUrl' : iconUrl,
            'fullTitle' : title
        });
        update(root);
        update(root);
    }

    // reduce title to less words
    // NEED smarter cropping
    function cropTitle(parentNode, title) {
        // return first word of the title
        return title.split(/[,\-\s|]/)[0];
    }

    function update(source) {
        // Compute the new height, function counts total children of root node and sets tree height accordingly.
        // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
        // This makes the layout more consistent.

        //. counts the number of nodes on each level and stores the result in levelWidth e.g. [1 4 3 2] (1 top root node)
        var levelWidth = [1];
        var childCount = function(level, n) {

            if (n.children && n.children.length > 0) {
                if (levelWidth.length <= level + 1) levelWidth.push(0);

                levelWidth[level + 1] += n.children.length;
                n.children.forEach(function(d) {
                    childCount(level + 1, d);
                });
            }
        };
        childCount(0, root);


        var newHeight = d3.max(levelWidth) * 120; // 120 pixels per line NEED-ADAPT reverse height and width + variable, not always 120
        tree = tree.size([newHeight, viewerWidth]);

        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Set widths between levels based on maxLabelLength.
        nodes.forEach(function(d) {
            //. d (=node) .depth = level diepte (integer), 0 voor root node
            d.y = (d.depth * (maxLabelLength * 10)); //maxLabelLength * 10px
            // alternatively to keep a fixed scale one can set a fixed depth per level
            // Normalize for fixed-depth by commenting out below line
            // d.y = (d.depth * 500); //500px per level.
        });

        // Update the nodes…
        node = svgGroup.selectAll("g.node")
            .data(nodes, function(d) {
                return d.id || (d.id = ++i);
            })
            .attr("id", function(d) { //. add "node-<id>" as html element id
                return "node-" + d.id;
            })
            .on("mouseover", function(d) { // TAG event-listeners-not-triggered
                var node = d3.select(this); // the node, this refers to source of event
                var menuItems = node.select("g.menu").selectAll("g.menu-item");

                // show menu items
                menuItems.transition().duration(duration)
                    .attr("transform",function(d,i){
                        return "rotate("+40*i+") translate(-45,-30)"; // NEED animate
                    });
            })
            .on("mouseout", function(node) {
                var node = d3.select(this); // the node, this refers to source of event
                var menuItems = node.select("g.menu").selectAll("g.menu-item");

                // hide menu items
                menuItems.transition().duration(duration)
                    .attr("transform",function(d,i){
                        return "translate(+45,+30) rotate("-40*i+")"; // NEED animate
                    });
                // TODO enhance menu accessibility with setTimeout(function(){}, 500); adn a status variable
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + source.y0 + "," + source.x0 + ")";
        });

        // NEED variabel maken
        var MENU_ITEMS = ['finish','delete','collapse'];

        // menu group containing the menu items
        var menuGroup = nodeEnter.append("g")
            .attr("class", "menu")
            .attr("x", -30);

        // menu items
        var menuItems = menuGroup.selectAll("g")
            .data(function (d) {
                var dataOut = [];
                for (var i=0; i<MENU_ITEMS.length; i++) {
                    dataOut.push({'name' : MENU_ITEMS[i], 'nodeData' : d})
                }
                return dataOut;
            })
            .enter()
            .append("g")
            .attr('name', function(d) {
                return d.name;
            })
            .attr("class", "menu-item");

        // add blank circles to menu item
        menuItems.append("circle")
            .attr("r", 15)
            .style("fill", "white");

        // number of 'pixels' of height and width
        var MENU_ICON_SIDE = 30;

        // add icons to menu items
        menuItems.append("image")
            .attr('xlink:href', function(d) {
                return "../images/menu/"+d.name+".png";
            })
            .attr("width", MENU_ICON_SIDE)
            .attr("height", MENU_ICON_SIDE)
            .attr("x", -MENU_ICON_SIDE/2)
            .attr("y", -MENU_ICON_SIDE/2);

        // add click event to collapse menu item
        d3.selectAll("[name=collapse]")
        .on('click',function (d) {
            clickToggle(d.nodeData,d3.select(d3.select(this).node().parentNode).node().parentNode);
        });

        // add click event to delete menu item
        d3.selectAll("[name=delete]")
        .on('click',function (d) {
            deleteNode(d.nodeData);
        });

        // add click event to delete menu item
        d3.selectAll("[name=finish]")
        .on('click',function (d) {
            finishNode(d.nodeData);
        });

        // center circle containing the main part of the node
        var centerGroup = nodeEnter.append("g")
            .attr("class", "center-group")
            .attr("x", -30)
            .on('click', function(d) {
                openNodeInTab(d);
            });

        //. added 'shadow' circle in grey
        centerGroup.append("circle")
            .attr('class', 'nodeMoonShadow')
            .attr("r", 30)
            .style("fill", "#8B8B8B") //. grey
            .attr("cx", 2) //. nasty! cx = circle-x instead of x (e.g. text)
            .attr("cy", 2);

        centerGroup.append("circle")
            .attr('class', 'nodeCircle')
            .attr("r", 30)
            .style("fill", "#fff");

        // number of 'pixels' of height and width
        var IMAGE_SIDE = 40;

        //. node favicon
        centerGroup.append('image')
            .attr('xlink:href', function(d) {
                return d.iconUrl;
            })
            .attr("width", IMAGE_SIDE)
            .attr("height", IMAGE_SIDE)
            .attr("x", -IMAGE_SIDE/2)
            .attr("y", -IMAGE_SIDE/2);

        //. blue round for child count indicator
        centerGroup.append("circle")
            .attr('class', 'node-child-counter-element')
            .attr("r", 14)
            .style("fill", "#0094ff") //. blue
            .attr("cx", 25)
            .attr("cy", 25);

        //. node title
        centerGroup.append("text")
            .attr("x", function(d) {
                return d.children || d._children ? -40 : 40;
            })
            .attr("dy", ".35em")
            .attr('class', 'nodeText')
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start"; //. alignes text left or right (dependent if text is positioned left or right of node)
            })
            .text(function(d) {
                return d.name;
            })
            .style("fill-opacity", 0);

        //. child count indicator text
        centerGroup.append("text") //. NEED ++ maken als meer dan 99
            .attr('class', 'node-child-counter-element')
            .attr("x", 25)
            .attr("y", 30)
            .attr("text-anchor", "middle") //. alignes text in center
            .text("0") //. NEED adjust +1 when addChild function is used
            .style("fill","white");

        // Update the text to reflect whether node has children or not.
        node.select('text')
            .attr("x", function(d) {
                return d.children || d._children ? -50 : 50; //. nodes with children have text to the left side of the node circle NEED-ADAPT remove
            })
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function(d) {
                return d.name;
            });

        // show or hide node-child-counter-elements depending on whether it has children and is collapsed
        node.selectAll(".node-child-counter-element")
            .style("visibility", function(d) {
                return d._children ? "visible" : "hidden";
            });

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Fade the text in
        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 0);

        nodeExit.select("text")
            .style("fill-opacity", 0);

        // Update the links…
        var link = svgGroup.selectAll("path.link")
            .data(links, function(d) {
                return d.target.id;
            });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d) {
                var o = {
                    x: source.x0,
                    y: source.y0
                };
                return diagonal({
                    source: o,
                    target: o
                });
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                var o = {
                    x: source.x,
                    y: source.y
                };
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    // Append a group which holds all nodes and which the zoom Listener can act upon.
    var svgGroup = baseSvg.append("g");

    // Define the root
    root = treeData;
    root.x0 = viewerHeight / 2;
    root.y0 = 0;

    // Layout the tree initially and center on the root node.
    update(root);
    update(root); // TODO remove, but otherwise events listeners (@event-listeners-not-triggered) are not triggered from start
    centerNode(root);
});
