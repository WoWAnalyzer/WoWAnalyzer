import styles from './GemBoxRow.module.scss';
import { EquipmentPerformance } from 'parser/ui/EquipmentPerformance';
import { CSSProperties, ReactNode } from 'react';
import { Tooltip } from 'interface/index';
import { Item as EventItem, Gem as EventGem } from 'parser/core/Events';
import Icon from 'interface/Icon';

const getBlockClassName = (value: EquipmentPerformance) => {
  switch (value) {
    case EquipmentPerformance.Perfect:
      return styles['perfect-block'];
    case EquipmentPerformance.Good:
      return styles['good-block'];
    case EquipmentPerformance.Ok:
      return styles['ok-block'];
    case EquipmentPerformance.Fail:
      return styles['bad-block'];
    case EquipmentPerformance.Potential:
      return styles['potential-block'];
    default:
      return 'background-color: brown';
  }
};

// Helper function to get the color based on EquipmentPerformance
const getPerformanceColor = (performance: EquipmentPerformance): string => {
  switch (performance) {
    case EquipmentPerformance.Perfect:
      return styles['perfect-gem'];
    case EquipmentPerformance.Good:
      return styles['good-gem'];
    case EquipmentPerformance.Ok:
      return styles['ok-gem'];
    case EquipmentPerformance.Fail:
      return styles['fail-gem'];
    case EquipmentPerformance.Potential:
      return styles['potential-gem'];
    default:
      return 'gray';
  }
};

export interface GemBoxRowEntry {
  item: EventItem;
  slotName: JSX.Element;
  value: {
    itemQP: EquipmentPerformance;
    gems: {
      gemQP: EquipmentPerformance;
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
                (gem: { gemQP: EquipmentPerformance; gem: EventGem }, gemIndex: number) => (
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
