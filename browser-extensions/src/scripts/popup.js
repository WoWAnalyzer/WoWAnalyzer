import ext from "./utils/ext";

var getUrl = (code) => {
  return `https://wowanalyzer.com/report/${code}`;
}

var template = (data) => {
  return (`
  <div class="site-description">
    <h3 class="title">This log can be analyzed!</h3>
    <p className="description">
      Report code is: <code>${data.code}</code>.
      <br/>
      You can navigate to WoWAnalyzer by pressing the Analyze button.
    </p>
  </div>
  <div class="action-container">
    <a href=${getUrl(data.code)} target="_blank" class="btn btn-primary">Analyze</a>
  </div>
  `);
}
var renderMessage = (message) => {
  var displayContainer = document.getElementById("display-container");
  displayContainer.innerHTML = `<p class='message'>${message}</p>`;
}

var renderBookmark = (data) => {
  var displayContainer = document.getElementById("display-container")
  if(data) {
    var tmpl = template(data);
    displayContainer.innerHTML = tmpl;  
  } else {
    renderMessage("Sorry, could not extract the report code.")
  }
}

ext.tabs.query({active: true, currentWindow: true}, function(tabs) {
  var activeTab = tabs[0];
  chrome.tabs.sendMessage(activeTab.id, { action: 'process-page' }, renderBookmark);
});
