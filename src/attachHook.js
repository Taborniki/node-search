/* attaches a hook to all hyperlinks on the current tab ONLY IF the tab is listed as being subject to the extension */
// NEED conditionally attack hook
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if(message == 'attach-hook')
		attachHook(sender);
});

// only attack hook if tab is subject to extension
function attachHook(sender) {
	// generate list of link (<a> tag) elements
	aList = document.getElementsByTagName('a');

	// assign eventlisteners to all
	for(var i=0; i < aList.length; i++) {
		aList[i].addEventListener("click", function (event) {
			// prevent link from opening
			event.preventDefault();

			// send message to extension NEED er wordt nu cross extension messaging gebruikt, kan dit niet simpeler?
			chrome.runtime.sendMessage(sender.id, {newNode: event.target.getAttribute("href")});
		});
	}

	console.log('hooked attached');
}
