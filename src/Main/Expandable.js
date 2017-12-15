import React from 'react';
import PropTypes from 'prop-types';

class Expandable extends React.PureComponent {
  static propTypes = {
    header: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
  };

  constructor() {
    super();
    this.state = {
      expanded: false,
    };
    this.handleToggle = this.handleToggle.bind(this);
  }

  handleToggle() {
    this.setState({
      expanded: !this.state.expanded,
    });
  }

  render() {
    const { header, children } = this.props;

    return (
      <div className={`expandable ${this.state.expanded ? 'expanded' : ''}`}>
        <div className="meta" onClick={this.handleToggle}>
          {header}
        </div>
        {this.state.expanded && (
          <div className="details">
            {children}
          </div>
        )}
      </div>
    );
  }
}

export default Expandable;
