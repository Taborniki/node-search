// this page has the sole purpose of managing the right click context menu

// NEED onload event of zo?
configureContextMenu();
addActiveTabEventListener();

var EXTENSION_TAB_ID = -1;
var openTabIds = [];
var activeTabId;
var contextMenuId;

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

		var message = {
				'type' : 'create-node',
				'sourceTabId' : tab.id,
				'targetUrl' : info.linkUrl
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

// check for launch-extension message
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if(message.type == 'launch-extension') {
		launchExtension(message);
		return true; // indicates asynchronous callback
	}
});

// launches the extension
function launchExtension(message) { // NEED send message, NEED add current tab to open tab ids!
	chrome.tabs.create({ url: "main.html"}, function (createdTab){
        setExtensionTabId(createdTab.id);

		// send message to add root node
		chrome.tabs.sendMessage(createdTab.id, {
			'type' : 'create-rootnode',
			'name' : message.name,
			'url' : message.url,
			'iconUrl' : message.iconUrl
		});
    });
}
