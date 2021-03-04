import React from 'react';
import { Link } from 'react-router-dom';

import articles from 'articles';
import DocumentTitle from 'interface/DocumentTitle';
import NotFound from 'interface/NotFound';

import NewsArticleLoader from './NewsArticleLoader';
import makeNewsUrl from './makeNewsUrl';
import 'interface/NewsPage.scss';

interface Props {
  articleId: string
}

const NewsPage = ({ articleId }: Props) => {
  const fileName = articles[articleId];

  if (!fileName) {
    return <NotFound/>;
  }

  return (
    <div className="container news">
      <NewsArticleLoader
        key={fileName}
        fileName={fileName}
        loader={<>
          <Breadcrumbs />
          <br /><br />
          <div className="spinner" style={{ fontSize: 5 }} />
          <DocumentTitle title="News" />
        </>}
        render={NewsArticle}
      />
    </div>
  );
};

const BASE_BREADCRUMBS = [
  <Link key="Home" to="/">Home</Link>,
  <Link key="News" to={makeNewsUrl('')}>News</Link>,
];

const Breadcrumbs = ({ title }: { title?: string }) => {
  const breadcrumbs = [...BASE_BREADCRUMBS, title].filter(Boolean)
  return (<>
    {breadcrumbs.map((item, index) => (
      <React.Fragment key={index}>
        {item}
        {index !== (breadcrumbs.length - 1) && (
          <>
            {' '}&gt;{' '}
          </>
        )}
      </React.Fragment>
    ))}
  </>);
};

const NewsArticle = ({ article }: { article: any }) => (
  <>
    <Breadcrumbs title={article.props.title} />
    {article}
    <DocumentTitle title={article.props.title} />
  </>
);

export default NewsPage;
