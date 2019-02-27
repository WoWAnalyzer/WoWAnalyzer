import React from 'react';

import NewsList from './List';

class News extends React.PureComponent {
  render() {
    return (
      <>
        <div id="news-top" />
        <NewsList topAnchor="news-top" />
      </>
    );
  }
}

export default News;
