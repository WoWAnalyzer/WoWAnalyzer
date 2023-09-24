import { Tooltip } from 'interface/index';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ReactNode } from 'react';

import './PerformanceBoxRow.scss';

/** A row of boxes colored based on performance */
export function PerformanceBoxRow({ values, onClickBox }: PerformanceBoxRowProps) {
  return (
    <div className="performance-block-row">
      {values.map((value, ix) => (
        <Tooltip key={ix} content={value.tooltip}>
          <div
            key={ix}
            className={`performance-block ${getBlockClassName(value)} ${value.className ?? ''}`}
            onClick={() => onClickBox?.(ix)}
          />
        </Tooltip>
      ))}
    </div>
  );
}

type PerformanceBoxRowProps = {
  values: BoxRowEntry[];
  onClickBox?: (index: number) => void;
};

/** An entry for a PerformanceBoxRow */
export type BoxRowEntry = {
  value: QualitativePerformance;
  tooltip?: ReactNode | string;
  className?: string;
};

export function getBlockClassName(value: BoxRowEntry) {
  switch (value.value) {
    case QualitativePerformance.Perfect:
      return 'perfect-block';
    case QualitativePerformance.Good:
      return 'good-block';
    case QualitativePerformance.Ok:
      return 'ok-block';
    case QualitativePerformance.Fail:
      return 'bad-block';
  }
}
