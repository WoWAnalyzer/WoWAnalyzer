import { Trans } from '@lingui/react/macro';
import colorForPerformance from 'common/colorForPerformance';
import { formatNumber, formatPercentage, formatThousands } from 'common/format';
import { Tooltip, TooltipElement } from 'interface';
import InformationIcon from 'interface/icons/Information';
import { BoolThreshold, NumberThreshold, ThresholdStyle } from 'parser/core/ParseResults';
import * as React from 'react';
import performanceForThresholds from './helpers/performanceForThresholds';
import { RuleContext } from './Rule';

export type RequirementThresholds = NumberThreshold | BoolThreshold;

interface Props {
  name: React.ReactNode;
  thresholds: RequirementThresholds;
  tooltip?: React.ReactNode;
  valueTooltip?: React.ReactNode;
  setPerformance: (performance: number) => void;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  fullWidth?: boolean;
}
const Requirement = ({
  name,
  thresholds,
  tooltip,
  valueTooltip,
  setPerformance,
  prefix,
  suffix,
  fullWidth,
}: Props) => {
  const formatThresholdsActual = (thresholds: RequirementThresholds) => {
    const actual = thresholds.actual as number;

    switch (thresholds.style) {
      case ThresholdStyle.PERCENTAGE:
        return `${formatPercentage(actual)}%`;
      case ThresholdStyle.NUMBER:
        return `${formatNumber(actual)}`;
      case ThresholdStyle.THOUSANDS:
        return `${formatThousands(actual)}`;
      case ThresholdStyle.DECIMAL:
        return `${actual.toFixed(2)}`;
      case ThresholdStyle.BOOLEAN:
        return actual ? <Trans id="common.yes">Yes</Trans> : <Trans id="common.no">No</Trans>;
      case ThresholdStyle.SECONDS:
        return `${actual.toFixed(2)}s`;
      default:
        throw new Error(`Unknown style: ${thresholds.style}`);
    }
  };

  const performance = performanceForThresholds(thresholds);

  const thresholdsN = thresholds as NumberThreshold;
  const max = thresholdsN.max !== undefined ? `/ ${thresholdsN.max}` : undefined;

  const actual = (
    <>
      {prefix} {formatThresholdsActual(thresholds)} {max} {suffix}
    </>
  );

  return (
    <div className={fullWidth ? 'col-md-12' : 'col-md-6'}>
      <div className="flex">
        <div className="flex-main">{name}</div>
        {tooltip && (
          <div className="flex-sub content-middle" style={{ marginLeft: 10 }}>
            <Tooltip content={tooltip}>
              <div>
                <InformationIcon />
              </div>
            </Tooltip>
          </div>
        )}
        <div
          className="flex-sub content-middle text-muted"
          style={{ minWidth: 55, marginLeft: 5, marginRight: 10 }}
        >
          <div className="text-right" style={{ width: '100%' }}>
            {valueTooltip ? (
              <TooltipElement content={valueTooltip}>{actual}</TooltipElement>
            ) : (
              actual
            )}
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
};

export default (props: Omit<Props, 'setPerformance'>) => (
  <RuleContext.Consumer>
    {(setPerformance: (performance: number) => void) => (
      <Requirement {...props} setPerformance={setPerformance} />
    )}
  </RuleContext.Consumer>
);
