export function install() {
  if (process.env.NODE_ENV === 'production') {
    window._paq = [];
    /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
    window._paq.push(['trackPageView']);
    window._paq.push(['enableLinkTracking']);
    (function () {
      const u = 'https://matomo.wowanalyzer.com/';
      window._paq.push(['setTrackerUrl', u + 'js/']);
      window._paq.push(['setSiteId', '1']);
      const d = document;
      const g = d.createElement('script');
      const s = d.getElementsByTagName('script')[0];
      g.type = 'text/javascript';
      g.async = true;
      g.defer = true;
      g.src = u + 'js/';
      s.parentNode.insertBefore(g, s);
    })();
  }
}
