import React from 'react';
import PropTypes from 'prop-types';

import articles from './Articles';

const View = ({ articleId }) => {
  const article = articles.find(article => article.title === articleId);
  return (
    <div className="container">
      {React.cloneElement(article.full, article)}
    </div>
  );
};
View.propTypes = {
  articleId: PropTypes.string.isRequired,
};

export default View;
