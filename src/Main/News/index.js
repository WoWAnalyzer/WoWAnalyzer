import React from 'react';

import articles from './Articles';

class News extends React.PureComponent {
  render() {
    return (
      articles.map(article => article.short || article.full)
    );
  }
}

export default News;
