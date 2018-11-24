import React from 'react';
import PropTypes from 'prop-types';

import './StatisticBox.css';
import STATISTIC_CATEGORY from './STATISTIC_CATEGORY';

export { default as STATISTIC_ORDER } from './STATISTIC_ORDER';
export { default as STATISTIC_CATEGORY } from './STATISTIC_CATEGORY';

class StatisticBox extends React.PureComponent {
  static propTypes = {
    icon: PropTypes.node,
    value: PropTypes.node.isRequired,
    tooltip: PropTypes.string,
    label: PropTypes.node.isRequired,
    footer: PropTypes.node,
    containerProps: PropTypes.object,
    warcraftLogs: PropTypes.string,
    category: PropTypes.string,
    position: PropTypes.number,
    children: PropTypes.node,
  };
  static defaultProps = {
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

  render() {
    const { icon, value, tooltip, label, footer, containerProps, warcraftLogs, children, ...others } = this.props;
    delete others.category;
    delete others.position;
    return (
      <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12" style={{ zIndex: this.state.expanded ? 2 : 1 }} {...containerProps}>
        <div className="panel statistic statistic-box expandable" {...others}>
          <div className="panel-body">
            <div style={{ position: 'relative' }}>
              <div className="label">
                {icon} {label}
              </div>
              <div className="value">
                {tooltip ? <dfn data-tip={tooltip}>{value}</dfn> : value}
              </div>

              {footer && (
                <div style={{ marginTop: '2em' }}>
                  {footer}
                </div>
              )}

              {warcraftLogs && (
                <div className="warcraft-logs-link">
                  <a href={warcraftLogs} target="_blank" rel="noopener noreferrer" data-tip="View details on Warcraft Logs">
                    <img src="/img/wcl.png" alt="Warcraft Logs logo" />
                  </a>
                </div>
              )}
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
        </div>
      </div>
    );
  }
}

export default StatisticBox;
