import React from 'react';
import PropTypes from 'prop-types';

import InformationIcon from 'interface/icons/Information';
import { formatNumber, formatPercentage, formatThousands } from 'common/format';

import colorForPerformance from './helpers/colorForPerformance';
import performanceForThresholds from './helpers/performanceForThresholds';
import { RuleContext } from './Rule';

class Requirement extends React.PureComponent {
  static propTypes = {
    name: PropTypes.node.isRequired,
    thresholds: PropTypes.object.isRequired,
    tooltip: PropTypes.string,
    valueTooltip: PropTypes.string,
    setPerformance: PropTypes.func,
    prefix: PropTypes.node,
    suffix: PropTypes.node,
  };

  constructor(props) {
    super(props);
    props.setPerformance(this.performance);
  }

  get performance() {
    return performanceForThresholds(this.props.thresholds);
  }

  formatThresholdsActual(thresholds) {
    switch (thresholds.style) {
      case 'percentage':
        return `${formatPercentage(thresholds.actual)}%`;
      case 'number':
        return `${formatNumber(thresholds.actual)}`;
      case 'thousands':
        return `${formatThousands(thresholds.actual)}`;
      case 'decimal':
        return `${thresholds.actual.toFixed(2)}`;
      case 'boolean':
        return thresholds.actual ? 'Yes' : 'No';
      case 'seconds':
        return `${thresholds.actual.toFixed(2)}s`;
      default:
        throw new Error(`Unknown style: ${thresholds.style}`);
    }
  }

  render() {
    const { name, thresholds, tooltip, valueTooltip, prefix, suffix } = this.props;

    const performance = this.performance;
    const actual = (
      <>
        {prefix} {this.formatThresholdsActual(thresholds)} {thresholds.max !== undefined && `/ ${thresholds.max}`} {suffix}
      </>
    );

    return (
      <div className="col-md-6">
        <div className="flex">
          <div className="flex-main">
            {name}
          </div>
          {tooltip && (
            <div
              className="flex-sub"
              style={{ marginLeft: 10 }}
            >
              <InformationIcon data-tip={tooltip} />
            </div>
          )}
          <div className="flex-sub content-middle text-muted" style={{ minWidth: 55, marginLeft: 5, marginRight: 10 }}>
            <div className="text-right" style={{ width: '100%' }}>
              {valueTooltip ? <dfn data-tip={valueTooltip}>{actual}</dfn> : actual}
            </div>
          </div>
          <div className="flex-sub content-middle" style={{ width: 50 }}>
            <div className="performance-bar-container">
              <div
                className="performance-bar"
                style={{
                  width: `${performance * 100}%`,
                  transition: 'background-color 800ms',
                  backgroundColor: colorForPerformance(performance),
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default props => (
  <RuleContext.Consumer>
    {setPerformance => (
      <Requirement
        {...props}
        setPerformance={setPerformance}
      />
    )}
  </RuleContext.Consumer>
);
