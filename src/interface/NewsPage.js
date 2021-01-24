import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import articles from 'articles';
import DocumentTitle from 'interface/DocumentTitle';

import NewsArticleLoader from './NewsArticleLoader';
import 'interface/NewsPage.scss';

class NewsPage extends React.PureComponent {
  static propTypes = {
    articleId: PropTypes.string.isRequired,
  };

  renderBreadcrumbs(breadcrumbs) {
    return breadcrumbs.map((item, index) => (
      <React.Fragment key={index}>
        {item}
        {index !== (breadcrumbs.length - 1) && (
          <>
            {' '}&gt;{' '}
          </>
        )}
      </React.Fragment>
    ));
  }

  render() {
    const fileName = articles[this.props.articleId];

    const breadcrumbs = [
      <Link key="Home" to="/">
        Home
      </Link>,
      <Link key="Announcements" to="/#Announcements">
        Announcements
      </Link>,
    ];

    return (
      <div className="container news">
        <NewsArticleLoader
          key={fileName}
          fileName={fileName}
        >
          {({ article, showLoader }) => showLoader ? (
            <>
              {this.renderBreadcrumbs(breadcrumbs)}<br /><br />

              <div className="spinner" style={{ fontSize: 5 }} />

              <DocumentTitle title="News" />
            </>
          ) : (
            <>
              {this.renderBreadcrumbs([
                ...breadcrumbs,
                article.props.title,
              ])}<br /><br />

              {article}

              <DocumentTitle title={article.props.title} />
            </>
          )}
        </NewsArticleLoader>
      </div>
    );
  }
}

export default NewsPage;
