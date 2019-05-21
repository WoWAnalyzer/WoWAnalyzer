import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Tooltip from 'common/Tooltip';
import InfoIcon from 'interface/icons/Info';
import DrilldownIcon from 'interface/icons/Link';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

import './Statistic.scss';

class Statistic extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    tooltip: PropTypes.node,
    wide: PropTypes.bool,
    ultrawide: PropTypes.bool,
    // eslint-disable-next-line react/no-unused-prop-types
    category: PropTypes.oneOf(Object.values(STATISTIC_CATEGORY)),
    // eslint-disable-next-line react/no-unused-prop-types
    position: PropTypes.number,
    size: PropTypes.oneOf(['standard', 'small', 'medium', 'large', 'flexible']),
    drilldown: PropTypes.string,
    dropdown: PropTypes.node,
    className: PropTypes.string,
  };
  static defaultProps = {
    size: 'standard',
    wide: false,
    ultrawide: false,
    className: '',
  };

  constructor(){
    super();
    this.state = {
      expanded: false,
    };

    this.toggleExpansion = this.toggleExpansion.bind(this);
  }

  componentWillMount() {
    this.setState({
      expanded: this.props.expanded,
    });
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      expanded: newProps.expanded,
    });
  }

  toggleExpansion() {
    this.setState({
      expanded: !this.state.expanded,
    });
  }

  renderDrilldown(drilldown) {
    const isAbsolute = drilldown.includes('://');

    return (
      <div className="drilldown">
        <Tooltip content="Drill down">
          {isAbsolute ? (
            <a href={drilldown} target="_blank" rel="noopener noreferrer">
              <DrilldownIcon />
            </a>
          ) : (
            <Link to={drilldown}>
              <DrilldownIcon />
            </Link>
          )}
        </Tooltip>
      </div>
    );
  }

  renderDropdown(dropdown){
    return (
      <>
        <div className="row">
          <div className="col-xs-12">
            {this.state.expanded && (
              <div className="statistic-expansion">
                {dropdown}
              </div>
            )}
          </div>
        </div>

        <div className="statistic-expansion-button-holster">
          <button onClick={this.toggleExpansion} className="btn btn-primary">
            {!this.state.expanded && <span className="glyphicon glyphicon-chevron-down" />}
            {this.state.expanded && <span className="glyphicon glyphicon-chevron-up" />}
          </button>
        </div>
      </>
    );
  }

  render() {
    const { children, wide, ultrawide, tooltip, size, drilldown, className, dropdown, ...others } = this.props;

    // TODO: Determine if drilldown is a relative or absolute URL. Absolute: has protocol. Relative: has no protocol.
    // TODO: Render drilldown link. Maybe on mouseover a small box expand below the statistic with a link?

    return (
      <div className={ultrawide ? 'col-md-12' : (wide ? 'col-md-6 col-sm-12 col-xs-12' : 'col-lg-3 col-md-4 col-sm-6 col-xs-12')}>
        <div
          className={`panel statistic ${size} ${className}`}
          // only add zIndex property if a dropdown exists, to preserve backwards compatiblity with StatisticBox utilizing Statistic
          style={dropdown && {zIndex: this.state.expanded ? 2 : 1 }}
          {...others}
        >
          <div className="panel-body">
            {children}
            {dropdown && this.renderDropdown(dropdown)}
          </div>
          {tooltip && (
            <Tooltip content={tooltip}>
              <div
                className="detail-corner"
                data-place="top"
              >
                <InfoIcon />
              </div>
            </Tooltip>
          )}
          {drilldown && this.renderDrilldown(drilldown)}
        </div>
      </div>
    );
  }
}

export default Statistic;
