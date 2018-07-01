import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import DocumentTitle from 'Interface/common/DocumentTitle';

import articles from './Articles';
import ArticleLoader from './ArticleLoader';

class Page extends React.PureComponent {
  static propTypes = {
    articleId: PropTypes.string.isRequired,
  };

  renderBreadcrumbs(breadcrumbs) {
    return breadcrumbs.map((item, index) => (
      <React.Fragment>
        {item}
        {index !== (breadcrumbs.length - 1) && (
          <React.Fragment>
            {' '}&gt;{' '}
          </React.Fragment>
        )}
      </React.Fragment>
    ));
  }

  render() {
    const fileName = articles[this.props.articleId];

    const breadcrumbs = [
      <Link to="/">
        Home
      </Link>,
      <Link to="/#Announcements">
        Announcements
      </Link>,
    ];

    return (
      <div className="container">
        <ArticleLoader
          key={fileName}
          fileName={fileName}
        >
          {({ article, showLoader }) => showLoader ? (
            <React.Fragment>
              {this.renderBreadcrumbs(breadcrumbs)}<br /><br />

              <div className="spinner" style={{ fontSize: 5 }} />

              <DocumentTitle title="News" />
            </React.Fragment>
          ) : (
            <React.Fragment>
              {this.renderBreadcrumbs([
                ...breadcrumbs,
                article.props.title,
              ])}<br /><br />

              {article}

              <DocumentTitle title={article.props.title} />
            </React.Fragment>
          )}
        </ArticleLoader>
      </div>
    );
  }
}

export default Page;
