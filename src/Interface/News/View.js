import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import articles from './Articles';
import ArticleLoader from './ArticleLoader';

class View extends React.PureComponent {
  static propTypes = {
    articleId: PropTypes.string.isRequired,
  };

  render() {
    const fileName = articles[this.props.articleId];

    return (
      <div className="container">
        <Link to="/">
          Home
        </Link> &gt;{' '}
        <Link to="/#Announcements">
          Announcements
        </Link>
        <ArticleLoader
          key={fileName}
          fileName={fileName}
        >
          {({ children, showLoader }) => showLoader ? <div className="spinner" style={{ fontSize: 5 }} /> : (
            <React.Fragment>
              {' '}&gt;{' '}
              {children && children.props.title}<br /><br />

              {children}
            </React.Fragment>
          )}
        </ArticleLoader>
      </div>
    );
  }
}

export default View;
