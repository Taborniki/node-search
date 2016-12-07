var DEFAULT_ICON_URL = 'images/nodes/favicon.ico';

// constructor
function TabManager (masterNode) {
	this.masterNode = masterNode;
	masterNode.setTabManager(this);
}

// open a webpage in a new page with a hook attached
TabManager.prototype.openPage = function(targetUrl, sourceNode, stage) {
	chrome.tabs.create({ url : targetUrl}, function(tab) {
		// wait for tab to load
		chrome.tabs.onUpdated.addListener(function(tabId , info) {
			if (tabId == tab.id && info.status == "complete") {
				function sendMessageToTab(tabId,sourceNode,stage) {
					// send message to content script attachHook.js to hook link tags
					chrome.tabs.sendMessage(tabId, 'attach-hook', function (response){
						if (typeof response !== 'undefined') { // TODO waarom komen er undefined responses terug?
							// send new message to tab
							sendMessageToTab(tabId,sourceNode,stage);

							// fetch icon url and title of the page
							var iconUrl = getIconUrl(response.newNodeUrl);
							getTitle(response.newNodeUrl).then(function(title) {
								// callback function for response NEED title and icon
								var newNode = new Node(sourceNode, iconUrl,title,response.newNodeUrl);
								// TODO netter, dit is een zootje
							    newNode.assignStage(stage);
								newNode.setTabManager(sourceNode.tabManager);
							    newNode.reDraw();
							});
						}
					});
				}

				// send the first message
				sendMessageToTab(tab.id,sourceNode,stage);
			}
		});
	});
};

// returns the title of a web page
function getTitle(url) {
	var promise =  new Promise(function(resolve, reject) {
		$.get(url)
			.done(function(data) {
				resolve(data.match(/<title[^>]*>([^<]+)<\/title>/)[1]);
			})
			.fail(function() {
				resolve('<No title>');
			});
	});

	return promise;
}

// returns the icon to be displayed for a web page
function getIconUrl(url) {
	var link = document.createElement("a");
    link.href = url;

	// check if http://host/favicon.ico exists
	var iconUrl = 'http://' + link.hostname + '/favicon.ico';
	var http = new XMLHttpRequest();
    http.open('HEAD', iconUrl, false);
	http.send();

	// if icon not found at url, set default icon
	if (http.status == 404)
		iconUrl = DEFAULT_ICON_URL;

	return iconUrl;
}
