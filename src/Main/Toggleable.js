import React from 'react';
import PropTypes from 'prop-types';

class Toggleable extends React.PureComponent {
  static propTypes = {
    toggledvalue: PropTypes.node.isRequired,
    value: PropTypes.node.isRequired,
    style: PropTypes.object,
  };

  constructor() {
    super();
    this.state = {
      toggled: true,
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState({
      toggled: !this.state.toggled,
    });
  }

  render() {
    const { toggledvalue, value, style, ...others } = this.props;
    return (
      <div onClick={this.handleClick} style={{cursor: 'pointer', ...style }} {...others}>
        {(this.state.toggled) ? toggledvalue : value}
      </div>);
  }
}

export default Toggleable;
