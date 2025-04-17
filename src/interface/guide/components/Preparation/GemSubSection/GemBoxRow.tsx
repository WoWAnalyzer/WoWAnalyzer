import styles from './GemBoxRow.module.scss';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
//import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { CSSProperties, ReactNode } from 'react';
import { Tooltip } from 'interface/index';
import Item from 'common/ITEMS/Item';
import Icon from 'interface/Icon';
import { Gem as EventGem } from 'parser/core/Events';

const getBlockClassName = (value: QualitativePerformance) => {
  switch (value) {
    case QualitativePerformance.Perfect:
      return styles['perfect-block'];
    case QualitativePerformance.Good:
      return styles['good-block'];
    case QualitativePerformance.Ok:
      return styles['ok-block'];
    case QualitativePerformance.Fail:
      return styles['bad-block'];
  }
};

// Helper function to get the color based on QualitativePerformance
const getPerformanceColor = (performance: QualitativePerformance): string => {
  switch (performance) {
    case QualitativePerformance.Perfect:
      return styles['perfect-gem'];
    case QualitativePerformance.Good:
      return styles['good-gem'];
    case QualitativePerformance.Ok:
      return styles['ok-gem'];
    case QualitativePerformance.Fail:
      return styles['fail-gem'];
    default:
      return 'gray';
  }
};

export interface GemBoxRowEntry {
  item: Item;
  slotName: JSX.Element;
  value: {
    itemQP: QualitativePerformance;
    gems: {
      gemQP: QualitativePerformance;
      gem: EventGem;
    }[];
  };
  tooltip: ReactNode;
}

interface GemBoxRowProps {
  values: GemBoxRowEntry[];
  style?: CSSProperties;
}

const GemBoxRow = ({ values }: GemBoxRowProps) => {
  return (
    <div className={styles['gem-block-row']}>
      {values.map((value, ix) => (
        <div className={styles['gem-block-column']} key={ix}>
          <Tooltip content={value.tooltip}>
            <div className={styles['gem-block'] + ' ' + getBlockClassName(value.value.itemQP)}>
              {value.value.gems.map(
                (gem: { gemQP: QualitativePerformance; gem: EventGem }, gemIndex: number) => (
                  <div
                    key={gemIndex}
                    className={styles['gem-icon'] + ' ' + getPerformanceColor(gem.gemQP)}
                  >
                    <Icon icon={gem.gem.icon} />
                  </div>
                ),
              )}
            </div>
          </Tooltip>
          {value.slotName}
        </div>
      ))}
    </div>
  );
};

export default GemBoxRow;
