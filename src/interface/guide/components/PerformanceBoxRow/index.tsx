import { Tooltip } from 'interface/index';
import './PerformanceBoxRow.scss';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

/** A row of boxes colored based on performance */
export function PerformanceBoxRow({ values, onClickBox }: PerformanceBoxRowProps) {
  return (
    <div className="performance-block-row">
      {values.map((value, ix) => (
        <Tooltip key={ix} content={value.tooltip}>
          <div
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
  style?: React.CSSProperties;
  onClickBox?: (index: number) => void;
};

/** An entry for a PerformanceBoxRow */
export type BoxRowEntry = {
  value: QualitativePerformance;
  tooltip?: React.ReactNode | string; // TODO default tooltip
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
