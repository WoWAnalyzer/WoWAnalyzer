import React from 'react';

import DocumentTitle from 'interface/common/DocumentTitle';
import TwitterIcon from 'interface/icons/Twitter';

import NewsList from './List';

class News extends React.PureComponent {
  render() {
    return (
      <>
        <DocumentTitle /> {/* prettiest is if the Home page has no title at all */}

        <div className="flex">
          <div className="flex-main">
            <h1 id="news-top">News</h1>
          </div>
          <div className="flex-sub" style={{ paddingTop: 30 }}>
            <small>More news?</small>
            <span style={{ fontSize: 18, marginLeft: 10 }}>
              <TwitterIcon colored /> <a href="https://twitter.com/WoWAnalyzer">Follow @WoWAnalyzer</a>
            </span>
          </div>
        </div>
        <NewsList topAnchor="news-top" />
      </>
    );
  }
}

export default News;
