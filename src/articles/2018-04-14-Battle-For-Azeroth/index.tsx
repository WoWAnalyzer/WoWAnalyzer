import NewsImageArticle from 'interface/NewsImageArticle';

import BackgroundImage from './Background.jpg';

export default (
  <NewsImageArticle title="Battle for Azeroth" image={BackgroundImage} style={{ paddingTop: 350 }}>
    Work has started on support for<b>Battle for Azeroth</b>. We continue to need contributions to
    get all specs compatible with Battle for Azeroth. If you want to help out, join us on{' '}
    <a href="/discord">Discord</a>or see the{' '}
    <a href="https://github.com/WoWAnalyzer/WoWAnalyzer#contributing">instructions on GitHub</a>.
    Our progress can be followed at<a href="https://wowanalyzer.com">wowanalyzer.com</a>.
  </NewsImageArticle>
);
