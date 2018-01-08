import React from 'react';

import articles from './Articles';

const News = () => articles.map(article => React.cloneElement(article, {
  key: `${article.props.title}-${article.props.published}`,
}));

export default News;
