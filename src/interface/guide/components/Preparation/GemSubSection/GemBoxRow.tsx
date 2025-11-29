import styles from './GemBoxRow.module.scss';
import { CSSProperties, ReactNode, type JSX } from 'react';
import { Tooltip } from 'interface/index';
import { Item as EventItem, Gem as EventGem } from 'parser/core/Events';
import Icon from 'interface/Icon';
import { type GemPerformance, TIME_GATED_UPGRADE } from 'parser/shared/modules/items/GemChecker';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

const getBlockClassName = (value: GemPerformance) => {
  switch (value) {
    case QualitativePerformance.Perfect:
      return styles['perfect-block'];
    case QualitativePerformance.Good:
      return styles['good-block'];
    case QualitativePerformance.Ok:
      return styles['ok-block'];
    case QualitativePerformance.Fail:
      return styles['bad-block'];
    case TIME_GATED_UPGRADE:
      return styles['potential-block'];
  }
};

export interface GemBoxRowEntry {
  item: EventItem;
  slotName: JSX.Element;
  value: {
    itemQP: GemPerformance;
    gems: {
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
              {value.value.gems.map((gem: { gem: EventGem }, gemIndex: number) => (
                <div key={gemIndex} className={styles['gem-icon']}>
                  <Icon icon={gem.gem.icon} />
                </div>
              ))}
            </div>
          </Tooltip>
          {value.slotName}
        </div>
      ))}
    </div>
  );
};

export default GemBoxRow;
