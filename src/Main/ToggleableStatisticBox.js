import React from 'react';
import PropTypes from 'prop-types';

import StatisticBox from './StatisticBox';

class ToggleableStatisticBox extends React.PureComponent {
  static propTypes = {
    toggledfooter: PropTypes.obj,
    footer: PropTypes.obj,
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
    const { toggledfooter, footer, ...others } = this.props;
    delete others.toggled;
    return (<StatisticBox
      footer={
        <div onClick={this.handleClick}>
        {(this.state.toggled) ? toggledfooter : footer}
        </div>
      }
      {...others}
    />);
  }
}

export default ToggleableStatisticBox;
