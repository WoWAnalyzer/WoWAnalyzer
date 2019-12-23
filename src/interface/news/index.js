import React from 'react';
import { Trans } from '@lingui/macro';

import DocumentTitle from 'interface/DocumentTitle';
import TwitterIcon from 'interface/icons/Twitter';

import NewsList from './List';

const News = () => (
  <>
    <DocumentTitle /> {/* prettiest is if the Home page has no title at all */}

    <div className="flex flex-news">
      <div className="flex-main">
        <h1 id="news-top"><Trans>New stuff</Trans></h1>
      </div>
      <div className="flex-sub flex-sub-news">
        <small>More news?</small>
        <span style={{ fontSize: 18, marginLeft: 10 }}>
          <TwitterIcon colored /> <a href="https://twitter.com/WoWAnalyzer" style={{ fontSize: 16 }}>Follow @WoWAnalyzer</a>
        </span>
      </div>
    </div>
    <NewsList topAnchor="news-top" />
  </>
);

export default News;
