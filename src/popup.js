function hello() {
    document.getElementById('fbp').innerHTML = "hier is de feedback";
    chrome.tabs.create({ url: "main.html"});
}

document.getElementById('fbp').innerHTML = "defValue";
document.getElementById('clickme').onclick = hello;
