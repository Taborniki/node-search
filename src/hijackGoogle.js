var thisPageDomain = window.location.href;
var googleRegex = /(www.|)(google.)[a-zA-Z0-9]+/;
var thisPageIsGoogle = googleRegex.test(thisPageDomain);

if (thisPageIsGoogle) {
	var imageUrl = chrome.extension.getURL("images/icons/icon23.png");

	// notorious html to inject
	var htmlToInject = "<div class=\"gsst_b sbib_c\" dir=\"ltr\" id=\"node-search-icon\" style=\"line-height: 44px;\"><a aria-label=\"Start Node Search\" class=\"gsst_a\"><span class=\"gsri_a\" id=\"gsri_ok0\" style=\"background: url(" + imageUrl + ");width: 23px;\"></span></a></div>";

	// create html element from string

	var dummyDiv = document.createElement('div');
	dummyDiv.innerHTML = htmlToInject;
	var nodeButton = dummyDiv.firstChild; // extracts the innerHTML

	// inject the notorious node search html button, wait for voice search icon to spawn
	var checkExist = setInterval(function() {
	   if ($('#gs_st0').length) {
		  var voiceSearch = document.getElementById('gs_st0');
	 	  voiceSearch.parentNode.insertBefore(nodeButton, voiceSearch);
		  // add event listener
		  $('#node-search-icon').click(function() {
			  // send message to background page to launch extension
			  chrome.runtime.sendMessage({
				  'type' : 'launch-extension',
				  'name' : $('#lst-ib').value, // input google search text
				  'url' : window.location.href,
				  'iconUrl' : "https://www.google.be/favicon.ico" // NEED lokaal opslaan?
			  });
		  });
	      clearInterval(checkExist);
	   }
	}, 100); // check every 100ms
}

/* to inject before item with id="gs_st0"

<div class="gsst_b sbib_c" dir="ltr" id="gs_st0" style="line-height: 44px;"> <!-- TAG mic -->
	<a aria-label="Start Node Search" class="gsst_a" href="javascript:void(0)"><span class="gsri_a" id="gsri_ok0" style="background: url(images/icons/icon23.png);width: 23px;"></span></a>
</div>


*/
