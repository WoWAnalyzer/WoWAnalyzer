import React from 'react';
import PropTypes from 'prop-types';

class ImageArticle extends React.PureComponent {
  static propTypes = {
    title: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
    image: PropTypes.node.isRequired,
    style: PropTypes.object,
  };

  render() {
    const { title, children, image, style } = this.props;

    return (
      <div className="panel image-overlay" style={{ backgroundImage: `url(${image})`, ...style }}>
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
    );
  }
}

export default ImageArticle;
