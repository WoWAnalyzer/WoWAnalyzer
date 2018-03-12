import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import articles from './Articles';

const View = ({ articleId }) => {
  const article = articles.find(article => article.props.title === articleId);
  return (
    <div className="container">
      <Link to="/">
        Home
      </Link> &gt;{' '}
      <Link to="/#Announcements">
        Announcements
      </Link> &gt;{' '}
      {article.props.title}<br /><br />

      {article}
    </div>
  );
};
View.propTypes = {
  articleId: PropTypes.string.isRequired,
};

export default View;
