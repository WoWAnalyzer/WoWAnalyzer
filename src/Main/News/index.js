import React from 'react';

import articles from './Articles';

class News extends React.PureComponent {
  render() {
    return (
      articles.map(article => (
        React.cloneElement(article.short || article.full, article)
      ))
    );
  }
}

export default News;
