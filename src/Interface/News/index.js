import React from 'react';

import articles from './Articles';
import ArticleLoader from './ArticleLoader';

const News = () => Object.values(articles)
  .sort((a, b) => b.localeCompare(a))
  .map(fileName => (
    <ArticleLoader
      key={fileName}
      fileName={fileName}
    >
      {({ children, showLoader }) => showLoader ? <div className="spinner" style={{ fontSize: 5 }} /> : children}
    </ArticleLoader>
  ));

export default News;
