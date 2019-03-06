import React from 'react';
import PropTypes from 'prop-types';

import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from './STATISTIC_CATEGORY';

export { default as STATISTIC_ORDER } from './STATISTIC_ORDER';
export { default as STATISTIC_CATEGORY } from './STATISTIC_CATEGORY';

/**
 * @deprecated Use `interface/statistic/Statistic` instead.
 */
class StatisticBox extends React.PureComponent {
  static propTypes = {
    icon: PropTypes.node,
    value: PropTypes.node.isRequired,
    tooltip: PropTypes.node,
    label: PropTypes.node.isRequired,
    footer: PropTypes.node,
    category: PropTypes.string,
    position: PropTypes.number,
    children: PropTypes.node,
    style: PropTypes.object,
  };
  static defaultProps = {
    category: STATISTIC_CATEGORY.GENERAL,
    style: {},
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
    const { icon, value, label, footer, children, style, ...others } = this.props;
    delete others.category;
    delete others.position;
    // TODO: make sure "tooltip" properties are correctly passed, if some contain HTML tags, fix them into <>...</>
    return (
      <Statistic
        {...others}
        className="statistic-box"
        style={{ ...style, height: 'auto', zIndex: this.state.expanded ? 2 : 1 }}
      >
        <div className="pad">
          <label>
            {icon} {label}
          </label>
          <div className="value">
            {value}
          </div>

          {footer && (
            <div style={{ marginTop: '0.5em' }}>
              {footer}
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
      </Statistic>
    );
  }
}

export default StatisticBox;
