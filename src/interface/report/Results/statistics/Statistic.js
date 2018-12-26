import React from 'react';
import PropTypes from 'prop-types';

import InfoIcon from 'interface/icons/Info';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

import './Statistic.css';

class Statistic extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    tooltip: PropTypes.node,
    large: PropTypes.bool,
    wide: PropTypes.bool,
    // eslint-disable-next-line react/no-unused-prop-types
    category: PropTypes.oneOf(STATISTIC_CATEGORY),
    // eslint-disable-next-line react/no-unused-prop-types
    position: PropTypes.number,
  };

  render() {
    const { children, large, wide, tooltip } = this.props;

    return (
      <div className={wide ? 'col-md-6 col-sm-12 col-xs-12' : 'col-lg-3 col-md-4 col-sm-6 col-xs-12'}>
        <div className={`panel statistic ${large ? 'large' : null}`}>
          <div className="panel-body">
            {children}
          </div>
          {tooltip && (
            <div className="detail-corner" data-tip={tooltip} data-place="top">
              <InfoIcon />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Statistic;
