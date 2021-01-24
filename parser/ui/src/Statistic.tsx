import React from 'react';
import { Link } from 'react-router-dom';

import { Tooltip } from 'interface';
import InfoIcon from 'interface/icons/Info';
import DrilldownIcon from 'interface/icons/Link';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import './Statistic.scss';

type Props = {
  children: React.ReactNode,
  /**
   * A tooltip node to be displayed when the user hovers over an information *(i)* icon in the
   * statistic box's top right corner.
   */
  tooltip?: React.ReactNode,
  wide: boolean,
  ultrawide: boolean,
  category?: STATISTIC_CATEGORY,
  position?: number,
  size: 'standard' | 'small' | 'medium' | 'large' | 'flexible',
  /**
   * A relative or absolute URL. If set, a button will be attached to the bottom of the statistic
   * box that a user can click to be sent to the given URL.
   */
  drilldown?: string,
  /**
   * A node to display upon the user clicking an *expand* arrow at the bottom of the statistic box.
   */
  dropdown?: React.ReactNode,
  /**
   * CSS class name(s) to apply to the statistic box.
   */
  className: string,
  expanded?: boolean,
}

class Statistic extends React.PureComponent<Props, { expanded?: boolean }> {
  static defaultProps = {
    size: 'standard',
    wide: false,
    ultrawide: false,
    className: '',
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      expanded: props.expanded,
    };

    this.toggleExpansion = this.toggleExpansion.bind(this);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.expanded !== this.props.expanded) {
      this.setState({
        expanded: this.props.expanded,
      });
    }
  }

  toggleExpansion() {
    this.setState({
      expanded: !this.state.expanded,
    });
  }

  renderDrilldown(drilldown: string) {
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

  renderDropdown(dropdown: React.ReactNode) {
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

    return (
      <div className={ultrawide ? 'col-md-12' : (wide ? 'col-md-6 col-sm-12 col-xs-12' : 'col-lg-3 col-md-4 col-sm-6 col-xs-12')}>
        <div
          className={`panel statistic ${size} ${className}`}
          // only add zIndex property if a dropdown exists, to preserve backwards compatiblity with StatisticBox utilizing Statistic
          style={dropdown ? { zIndex: this.state.expanded ? 2 : 1 } : undefined}
          {...others}
        >
          <div className="panel-body">
            {children}
            {dropdown && this.renderDropdown(dropdown)}
          </div>
          {tooltip && (
            <Tooltip content={tooltip}>
              <div className="detail-corner" data-place="top">
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
