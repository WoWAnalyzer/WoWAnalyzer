export function install() {
  if (process.env.NODE_ENV === 'production') {
    const _paq = [];
    /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    (function () {
      const u = '//matomo.wowanalyzer.com/';
      _paq.push(['setTrackerUrl', u + 'piwik.php']);
      _paq.push(['setSiteId', '1']);
      const d = document;
      const g = d.createElement('script');
      const s = d.getElementsByTagName('script')[0];
      g.type = 'text/javascript';
      g.async = true;
      g.defer = true;
      g.src = u + 'piwik.js';
      s.parentNode.insertBefore(g, s);
    })();
  }
}
