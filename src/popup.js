document.getElementById('clickme').onclick = function() {
    chrome.tabs.create({ url: "main.html"}, function (createdTab){
        chrome.extension.getBackgroundPage().setExtensionTabId(createdTab.id);
    });
};
