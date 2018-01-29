import React from 'react';
import PropTypes from 'prop-types';

class RegularArticle extends React.PureComponent {
  static propTypes = {
    title: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
    bodyStyle: PropTypes.object,
  };

  render() {
    const { title, children, bodyStyle } = this.props;

    return (
      <div className="panel">
        <div className="panel-heading">
          <h2>{title}</h2>
        </div>
        <div className="panel-body" style={bodyStyle}>
          {children}
        </div>
      </div>
    );
  }
}

export default RegularArticle;
