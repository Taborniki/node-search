// NEED onload event of zo?
configureContextMenu();
addActiveTabEventListener();

var EXTENSION_TAB_ID = -1;
var openTabIds = [];
var activeTabId;
var contextMenuId;
var lastGoogleLink = "";

// adds the 'add node option' to the context menu
function configureContextMenu() {
	contextMenuId = chrome.contextMenus.create({
		"title" : 'Add to current search',
		"contexts" :["link"],
		"onclick" : handleContextClick,
		"enabled" : false
	});
}

function handleContextClick(info, tab) {
	if (EXTENSION_TAB_ID != -1) {

		// refactor link if source is google search
		var url = new URL(tab.url);
	  	var domain = url.hostname;
		var googleRegex = /(www.|)(google.)[a-zA-Z0-9]+/;
		var domainIsGoogle = googleRegex.test(domain);
		if (domainIsGoogle) {
			var targetUrl = lastGoogleLink;
		}
		else {
			var targetUrl = info.linkUrl;
		}

		var message = {
				'type' : 'create-node',
				'sourceTabId' : tab.id,
				'targetUrl' : targetUrl
		};

		chrome.tabs.sendMessage(EXTENSION_TAB_ID, message);
	}
	// TODO error message if -1
}

function setExtensionTabId (id) {
	EXTENSION_TAB_ID = id;
}

function addOpenTab (id) {
	if (openTabIds.indexOf(id) == -1)
		openTabIds.push(id);
}

function removeOpenTab (id) {
	if (openTabIds.indexOf(id) != -1)
		openTabIds.splice(indexOf(id),1);
}

function addActiveTabEventListener () {

	chrome.tabs.onActivated.addListener(function(info) { updateContextMenu(info.tabId) });
	chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
	    if (tabId == activeTabId) {
	        updateContextMenu(tabId);
	    }
	});

	function updateContextMenu(tabId) {
	    activeTabId = tabId;

		if (openTabIds.indexOf(tabId) != -1) {
			// the tab is opened by the extension, enable menu
			chrome.contextMenus.update(contextMenuId, {'enabled' : true});
		}
		else {
			// the tab is not openend by the extension, disable menu
			chrome.contextMenus.update(contextMenuId, {'enabled' : false});
		}
	}
}

// check for launch-extension OR mousedown-google message
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if (message.type == 'launch-extension') {
		launchExtension(message, sender.tab.id);

		// register google search tab as open extension tab
		var senderTabId = sender.tab.id;
		addOpenTab(senderTabId);

		return true; // indicates asynchronous callback
	}
	else if (message.type == 'mousedown-google') {
		lastGoogleLink = message.url;
	}
});

// launches the extension
function launchExtension(message, googleInitTabId) {
	chrome.tabs.create({ url: "main.html"}, function (createdTab){
        setExtensionTabId(createdTab.id);

		chrome.tabs.onUpdated.addListener(function(tabId , info) {
			if (tabId == createdTab.id && info.status == "complete") {
				// send message to add root node
				chrome.tabs.sendMessage(createdTab.id, {
					'type' : 'create-rootnode',
					'name' : message.name,
					'url' : message.url,
					'iconUrl' : message.iconUrl,
					'googleInitTabId' : googleInitTabId
				});
			}
		});
    });
}
