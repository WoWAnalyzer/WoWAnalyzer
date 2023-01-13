import articles from 'articles';
import DocumentTitle from 'interface/DocumentTitle';
import NotFound from 'interface/NotFound';
import { Fragment } from 'react';
import { Link, useParams } from 'react-router-dom';

import makeNewsUrl from './makeNewsUrl';
import NewsArticleLoader from './NewsArticleLoader';
import 'interface/NewsPage.scss';

const NewsPage = () => {
  const { articleId } = useParams();
  const decodedArticleId = decodeURI(articleId?.replace(/\+/g, ' ') ?? '');
  const fileName = articles[decodedArticleId];

  if (!fileName) {
    return <NotFound />;
  }

  return (
    <div className="container news">
      <NewsArticleLoader
        key={fileName}
        fileName={fileName}
        loader={
          <>
            <Breadcrumbs />
            <br />
            <br />
            <div className="spinner" style={{ fontSize: 5 }} />
            <DocumentTitle title="News" />
          </>
        }
        render={NewsArticle}
      />
    </div>
  );
};

const BASE_BREADCRUMBS = [
  <Link key="Home" to="/">
    Home
  </Link>,
  <Link key="News" to={makeNewsUrl('')}>
    News
  </Link>,
];

const Breadcrumbs = ({ title }: { title?: string }) => {
  const breadcrumbs = [...BASE_BREADCRUMBS, title].filter(Boolean);
  return (
    <>
      {breadcrumbs.map((item, index) => (
        <Fragment key={index}>
          {item}
          {index !== breadcrumbs.length - 1 && <> &gt; </>}
        </Fragment>
      ))}
    </>
  );
};

const NewsArticle = ({ article }: { article: any }) => (
  <>
    <Breadcrumbs title={article.props.title} />
    {article}
    <DocumentTitle title={article.props.title} />
  </>
);

export default NewsPage;
