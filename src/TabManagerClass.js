
// constructor
function TabManager (masterNode) {
	this.masterNode = masterNode;
}

// open a webpage in a new page with a hook attached
TabManager.prototype.openPage = function(targetUrl) {
	chrome.tabs.create({ url : targetUrl}, function(tab) {
		// wait for tab to load
		chrome.tabs.onUpdated.addListener(function(tabId , info) {
			if (tabId == tab.id && info.status == "complete") {
				// send message to content script attachHook.js to hook link tags
				chrome.tabs.sendMessage(tab.id, 'attach-hook');
			}
		});
	});
};

// start listener for incoming messages from spawned tabs
TabManager.prototype.initMessageListener = function() {
	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
		console.log(message);
		console.log(sender);
		// NEED iets mee doen
	});
};
