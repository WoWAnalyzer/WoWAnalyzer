import React from 'react';
import PropTypes from 'prop-types';

import ReactTooltip from 'react-tooltip';
import './StatisticBox.css';
import STATISTIC_CATEGORY from './STATISTIC_CATEGORY';

export { default as STATISTIC_ORDER } from './STATISTIC_ORDER';
export { default as STATISTIC_CATEGORY } from './STATISTIC_CATEGORY';

class StatisticBox extends React.PureComponent {
  static propTypes = {
    icon: PropTypes.node.isRequired,
    value: PropTypes.node.isRequired,
    tooltip: PropTypes.string,
    label: PropTypes.node.isRequired,
    footer: PropTypes.node,
    footerStyle: PropTypes.object,
    containerProps: PropTypes.object,
    item: PropTypes.bool,
    alignIcon: PropTypes.string,
    warcraftLogs: PropTypes.string,
    category: PropTypes.string,
    position: PropTypes.number,
    children: PropTypes.node,
  };
  static defaultProps = {
    alignIcon: 'center',
    category: STATISTIC_CATEGORY.GENERAL,
  };

  constructor() {
    super();
    this.state = {
      expanded: false,
    };

    this.toggleExpansion = this.toggleExpansion.bind(this);
  }

  componentWillMount() {
    this.setState({
      icon: this.props.icon,
      value: this.props.value,
      label: this.props.label,
      expanded: this.props.expanded,
      tooltip: this.props.tooltip,
    });
  }

  componentDidUpdate() {
    ReactTooltip.hide();
    ReactTooltip.rebuild();
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      icon: newProps.icon,
      value: newProps.value,
      label: newProps.label,
      expanded: newProps.expanded,
      tooltip: newProps.tooltip,
    });
  }

  toggleExpansion() {
    this.setState({
      expanded: !this.state.expanded,
    });
  }

  render() {
    const { icon, value, tooltip, label, footer, footerStyle, containerProps, item, alignIcon, warcraftLogs, children, ...others } = this.props;
    delete others.category;
    delete others.position;
    return (
      <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12" style={{ zIndex: this.state.expanded ? 2 : 1 }} {...containerProps}>
        <div className={`panel statistic-box expandable${item && ' item'}`} {...others}>
          <div className="panel-body">
            <div className="flex">
              <div className="flex-sub statistic-icon" style={{ display: 'flex', alignItems: alignIcon }}>
                {icon}
              </div>
              <div className="flex-main" style={{ position: 'relative', paddingLeft: 16 }}>
                <div className="slabel">
                  {label}
                </div>
                <div className="value">
                  {tooltip ? <dfn data-tip={tooltip}>{value}</dfn> : value}
                </div>

                {warcraftLogs && (
                  <div className="warcraft-logs-link">
                    <a href={warcraftLogs} target="_blank" rel="noopener noreferrer" data-tip="View details on Warcraft Logs">
                      <img src="/img/wcl.png" alt="Warcraft Logs logo" />
                    </a>
                  </div>
                )}
              </div>
            </div>
              {children && (
                <>
                <div className="row">
                  <div className="col-xs-12">
                    {this.state.expanded && (
                      <div className="statistic-expansion">
                        {children}
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
              )}
          </div>
          {footer && (
            <div className="panel-footer" style={{ padding: 0, borderTop: 0, ...footerStyle }}>
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default StatisticBox;
