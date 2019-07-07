import React from "react";
import PropTypes from 'prop-types';

import Icon from "common/Icon";

class RaidBuff extends React.PureComponent {
  static propTypes = {
    icon: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
  };

  render() {
    const { icon, count } = this.props;

    return (
      <div className="panel">
        <Icon icon={icon} className="icon" />
        <div className="count">{count}</div>
      </div>
    );
  }
}

export default RaidBuff;