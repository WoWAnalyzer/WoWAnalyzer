import ext from "./utils/ext";

var extractTags = () => {
  var url = document.location.href;

  var regex = /warcraftlogs\.com\/reports\/([a-zA-z1-9]+)/;
  if(!url || !regex.test(url)) return;
  var code = url.match(regex)[1];
  if (!code) return;

  var data = {
    url: document.location.href,
    code: code
  }

  return data;
}

function onRequest(request, sender, sendResponse) {
  if (request.action === 'process-page') {
    sendResponse(extractTags())
  }
}

ext.runtime.onMessage.addListener(onRequest);