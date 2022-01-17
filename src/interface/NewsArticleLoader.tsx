import retryingPromise from 'common/retryingPromise';
import { useState, useEffect } from 'react';
import * as React from 'react';

interface Props {
  fileName: string;
  loader: React.ReactNode;
  render?: (article: any) => any;
}

const NewsArticleLoader = ({ fileName, loader, render }: Props) => {
  const [article, setArticle] = useState(null);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    setShowLoader(!article);
  }, [article]);

  useEffect(() => {
    retryingPromise(() =>
      import(/* webpackChunkName: "articles/[request]" */ `articles/${fileName}/index.tsx`)
        .then((exports) => exports.default)
        .then((article) => setArticle(article)),
    );
  }, [fileName]);

  if (showLoader) {
    return loader;
  }

  return render ? render({ article }) : article;
};

export default NewsArticleLoader;
