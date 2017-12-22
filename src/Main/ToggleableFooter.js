import React from 'react';
import PropTypes from 'prop-types';

class ToggleableFooter extends React.PureComponent {
  static propTypes = {
    toggleddata: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
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
    const { toggleddata, data, ...others } = this.props;
    return (
      <div onClick={this.handleClick} {...others}>
        {(this.state.toggled) ? toggleddata : data}
      </div>);
  }
}

export default ToggleableFooter;
