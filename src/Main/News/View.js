import React from 'react';
import PropTypes from 'prop-types';

import articles from './Articles';

const View = ({ articleId }) => {
  const article = articles.find(article => article.props.title === articleId);
  return (
    <div className="container">
      {article}
    </div>
  );
};
View.propTypes = {
  articleId: PropTypes.string.isRequired,
};

export default View;
