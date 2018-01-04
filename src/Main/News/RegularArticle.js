import React from 'react';
import PropTypes from 'prop-types';

class RegularArticle extends React.PureComponent {
  static propTypes = {
    title: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
  };

  render() {
    const { title, children } = this.props;

    return (
      <div className="panel">
        <div className="panel-heading">
          <h2>{title}</h2>
        </div>
        <div className="panel-body">
          {children}
        </div>
      </div>
    );
  }
}

export default RegularArticle;
