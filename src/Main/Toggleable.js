import React from 'react';
import PropTypes from 'prop-types';

class Toggleable extends React.PureComponent {
  static propTypes = {
    toggledvalue: PropTypes.object.isRequired,
    value: PropTypes.object.isRequired,
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
    const { toggledvalue, value, ...others } = this.props;
    return (
      <div onClick={this.handleClick} {...others}>
        {(this.state.toggled) ? toggledvalue : value}
      </div>);
  }
}

export default Toggleable;
