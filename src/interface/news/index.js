import React from 'react';

import DocumentTitle from 'interface/common/DocumentTitle';

import NewsList from './List';

class News extends React.PureComponent {
  render() {
    return (
      <>
        <DocumentTitle /> {/* prettiest is if the Home page has no title at all */}

        <h1 id="news-top">News</h1>
        <NewsList topAnchor="news-top" />
      </>
    );
  }
}

export default News;
