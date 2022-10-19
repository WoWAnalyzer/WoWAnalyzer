import { Tooltip } from 'interface/index';
import './PerformanceBoxRow.scss';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { useCallback, useState } from 'react';

/** A row of boxes colored based on performance */
export function PerformanceBoxRow({ values }: PerformanceBoxRowProps) {
  // size boxes to fit in one row, if practically possible
  const [refWidth, setRefWidth] = useState(800);
  const ref = useCallback((node: HTMLDivElement) => {
    node && setRefWidth(node.getBoundingClientRect().width);
  }, []);
  const size = blockSize(values.length, refWidth);

  return (
    <div className="performance-block-row" ref={ref}>
      {values.map((value, ix) => (
        <Tooltip key={ix} content={value.tooltip}>
          <div
            className={'performance-block ' + getBlockClassName(value)}
            style={{
              width: size - 2, // minus 2 to account for margin
            }}
          />
        </Tooltip>
      ))}
    </div>
  );
}

type PerformanceBoxRowProps = {
  values: TimelineEntry[];
  style?: React.CSSProperties;
};

type TimelineEntry = {
  value: QualitativePerformance;
  tooltip?: React.ReactNode | string; // TODO default tooltip
};

/** Gets the width a block should be so it fits neatly in one row */
function blockSize(numValues: number, refWidth: number): number {
  const size = refWidth / numValues;
  return Math.max(Math.min(Math.floor(size), 60), 10); // min size = 10, max size = 60
}

function getBlockClassName(value: TimelineEntry) {
  if (value.value === 'perfect') {
    return 'perfect-block';
  } else if (value.value === 'good' || value.value === true) {
    return 'good-block';
  } else if (value.value === 'ok') {
    return 'ok-block';
  } else {
    // bad / false
    return 'bad-block';
  }
}
