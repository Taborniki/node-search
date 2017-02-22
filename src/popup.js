function hello() {
    document.getElementById('fbp').innerHTML = "hier is de feedback";
    chrome.tabs.create({ url: "main.html"});
}

document.getElementById('fbp').innerHTML = "defValue";
document.getElementById('clickme').onclick = hello;

document.getElementById('launch-eg-3').onclick = function() {
    chrome.tabs.create({ url: "testpages/d3-eg-3.html"});
};
