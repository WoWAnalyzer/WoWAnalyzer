import { Tooltip } from 'interface/index';

import { BoxRowEntry, getBlockClassName } from '../PerformanceBoxRow';
import './PerformanceBoxRowGrid.scss';

type PerformanceBoxRowGridProps = {
  values: BoxRowEntry[];
  onClickBox?: (index: number) => void;
};

/** Variant of {@link PerformanceBoxRow} that uses grid instead of flex */
const PerformanceBoxRowGrid = ({ values, onClickBox }: PerformanceBoxRowGridProps) => {
  return (
    <div className="performance-block-row-grid">
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
};

export default PerformanceBoxRowGrid;
