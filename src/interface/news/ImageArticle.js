import React from 'react';
import PropTypes from 'prop-types';

const ImageArticle = props => {
  const { title, children, image, style } = props;

  return (
    <article>
      <div className="panel image-background" style={{ backgroundImage: `url(${image})`, ...style }}>
        <div className="panel-body">
          <div className="row">
            <div className="col-md-10">
              <h1>{title}</h1>
              <div className="description">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

ImageArticle.propTypes = {
  title: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  image: PropTypes.node.isRequired,
  style: PropTypes.object,
};

export default ImageArticle;
