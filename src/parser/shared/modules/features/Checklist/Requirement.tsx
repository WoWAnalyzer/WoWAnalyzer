import React from 'react';
import PropTypes from 'prop-types';

import InformationIcon from 'interface/icons/Information';
import { formatNumber, formatPercentage, formatThousands } from 'common/format';
import Tooltip, { TooltipElement } from 'common/Tooltip';
import colorForPerformance from 'common/colorForPerformance';

import performanceForThresholds from './helpers/performanceForThresholds';
import { RuleContext } from './Rule';
import { ThresholdDef } from 'parser/core/ParseResults';
import { ThresholdStyle } from 'parser/core/Thresholds';

interface Props {
  name: React.ReactNode,
  thresholds: ThresholdDef,
  tooltip: React.ReactNode,
  valueTooltip: React.ReactNode,
  setPerformance: PropTypes.func,
  prefix?: React.ReactNode,
  suffix?: React.ReactNode,
}
class Requirement extends React.PureComponent<Props> {

  constructor(props: Props) {
    super(props);
    props.setPerformance(this.performance);
  }

  get performance() {
    return performanceForThresholds(this.props.thresholds);
  }

  formatThresholdsActual(thresholds: ThresholdDef) {
    switch (thresholds.style) {
      case ThresholdStyle.PERCENTAGE:
        return `${formatPercentage(thresholds.actual)}%`;
      case ThresholdStyle.NUMBER:
        return `${formatNumber(thresholds.actual)}`;
      case ThresholdStyle.THOUSANDS:
        return `${formatThousands(thresholds.actual)}`;
      case ThresholdStyle.DECIMAL:
        return `${thresholds.actual.toFixed(2)}`;
      case ThresholdStyle.BOOLEAN:
        return thresholds.actual ? 'Yes' : 'No';
      case ThresholdStyle.SECONDS:
        return `${thresholds.actual.toFixed(2)}s`;
      case ThresholdStyle.ABSOLUTE:
        return `${thresholds.actual}`;
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
              <Tooltip content={tooltip}>
                <div>
                  <InformationIcon />
                </div>
              </Tooltip>
            </div>
          )}
          <div className="flex-sub content-middle text-muted" style={{ minWidth: 55, marginLeft: 5, marginRight: 10 }}>
            <div className="text-right" style={{ width: '100%' }}>
              {valueTooltip ? <TooltipElement content={valueTooltip}>{actual}</TooltipElement> : actual}
            </div>
          </div>
          <div className="flex-sub content-middle" style={{ width: 50 }}>
            <div className="performance-bar-container">
              <div
                className="performance-bar small"
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
