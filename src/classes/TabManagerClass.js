var DEFAULT_ICON_URL = 'images/nodes/favicon.ico';

var tabNodeMap = {};
var addNodeFunction;

// constructor
function TabManager () {} // empty constructor

// open a webpage in a new page with a hook attached
TabManager.prototype.openPage = function(targetUrl, sourceNode) {
	var promise =  new Promise(function(resolve, reject) {
		chrome.tabs.create({ url : targetUrl}, function(tab) {
			// add tab id to list of open tabs TODO ook weer verwijderen wanneer tab geclosed wordt (wss geen issue voorlopig omdat id's toch niet hergebruikt worden)
			chrome.extension.getBackgroundPage().addOpenTab(tab.id);

			// register node with tab id
			tabNodeMap[tab.id] = sourceNode;

			// wait for tab to load
			/* TODO alles van attach-hook weg doen
			chrome.tabs.onUpdated.addListener(function(tabId , info) {
				if (tabId == tab.id && info.status == "complete") {
					function sendMessageToTab(tabId,sourceNode) {
						// send message to content script attachHook.js to hook link tags
						chrome.tabs.sendMessage(tabId, 'attach-hook', function (response){
							if (typeof response !== 'undefined') { // TODO waarom komen er undefined responses terug?
								// send new message to tab
								sendMessageToTab(tabId,sourceNode);

								// fetch icon url and title of the page
								var iconUrl = getIconUrl(response.newNodeUrl).then(function(iconUrl) {
									getTitle(response.newNodeUrl).then(function(title) {
										addNodeFct(sourceNode, title, response.newNodeUrl, iconUrl);
									});
								});
							}
						});
					}

					// send the first message
					sendMessageToTab(tab.id,sourceNode);
				}
			}); */
		});
	});

	return promise;

};

// wait for messages from background.js because contextMenu is fired
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if(message.type == 'create-node') {
		if (message.sourceTabId in tabNodeMap) { // the message concerns a registered tab
			// fetch icon url and title of the page NEED rewrite to avoid duplicate code
			var iconUrl = getIconUrl(message.targetUrl).then(function(iconUrl) {
				getTitle(message.targetUrl).then(function(title) {
					addNodeFunction(tabNodeMap[message.sourceTabId], title, message.targetUrl, iconUrl);
				});
			});
		}
		return true; // indicates asynchronous callback
	}
});

// returns the title of a web page
function getTitle(url) {
	var promise =  new Promise(function(resolve, reject) {
		$.get(url)
			.done(function(data) {
				try {
					resolve(data.match(/<title[^>]*>([^<]+)<\/title>/)[1]);
				}
				catch(err) {
				    resolve('<No title>');
				}
			})
			.fail(function() {
				resolve('<No title>');
			});
	});

	return promise;
}

// returns the icon to be displayed for a web page
function getIconUrl(url) {
	var promise =  new Promise(function(resolve, reject) {
		var link = document.createElement("a");
	    link.href = url;

		// check if http://host/favicon.ico exists
		var iconUrl = 'http://' + link.hostname + '/favicon.ico';

		// using jQuery because plain js methods always give an error in console on 404
		$.get(iconUrl)
	    .done(function() {
	        resolve(iconUrl);
	    }).fail(function() {
	        resolve(DEFAULT_ICON_URL);
	    })
	});

	return promise;
}
