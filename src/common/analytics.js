function init() {
  window._paq = window._paq || [];
}
function paq() {
  return window._paq;
}
function installed() {
  return !!window._paq;
}
function push(...args) {
  return paq().push(...args);
}

export function install() {
  if (process.env.NODE_ENV === 'production') {
    init();
    /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
    push(['trackPageView']);
    push(['enableLinkTracking']);

    const u = 'https://matomo.wowanalyzer.com/';
    push(['setTrackerUrl', u + 'js/']);
    push(['setSiteId', '1']);
    const d = document;
    const g = d.createElement('script');
    const s = d.getElementsByTagName('script')[0];
    g.type = 'text/javascript';
    g.async = true;
    g.defer = true;
    g.src = u + 'js/';
    s.parentNode.insertBefore(g, s);
  }
}

export function track(oldLocation, newLocation) {
  if (installed()) {
    push(['setReferrerUrl', oldLocation]);
    push(['setDocumentTitle', document.title]);
    push(['setCustomUrl', newLocation]);
    push(['trackPageView']);
  }
}
