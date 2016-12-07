/* attaches a hook to all hyperlinks on the current tab ONLY IF the tab is listed as being subject to the extension */
// NEED conditionally attack hook
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if(message == 'attach-hook') {
		attachHook(sender,sendResponse);
		setToastrOptions();
		return true; // indicates asynchronous callback
	}
});

// only attack hook if tab is subject to extension
function attachHook(sender,sendResponse) {
	// generate list of link (<a> tag) elements
	aList = document.getElementsByTagName('a');

	// assign eventlisteners to all
	for(var i=0; i < aList.length; i++) {
		aList[i].addEventListener("click", function (event) {
			// prevent link from opening
			event.preventDefault();

			// send message to extension with url to create a new node from
			sendResponse({newNodeUrl : event.target.getAttribute('href')});

			// show notification
			toastr.success("Node added!");
		});
	}
}

// sets the toastr.js options
function setToastrOptions() {
	toastr.options = {
	  "closeButton": false,
	  "debug": false,
	  "newestOnTop": false,
	  "progressBar": false,
	  "positionClass": "toast-top-right",
	  "preventDuplicates": false,
	  "onclick": null,
	  "showDuration": "300",
	  "hideDuration": "1000",
	  "timeOut": "5000",
	  "extendedTimeOut": "1000",
	  "showEasing": "swing",
	  "hideEasing": "linear",
	  "showMethod": "fadeIn",
	  "hideMethod": "fadeOut"
	}
}
