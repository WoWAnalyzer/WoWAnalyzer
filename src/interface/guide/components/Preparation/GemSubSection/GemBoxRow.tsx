import styles from './GemBoxRow.module.scss';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { CSSProperties, ReactNode } from 'react';
import { Tooltip } from 'interface/index';
import Item from 'common/ITEMS/Item';
import Icon from 'interface/Icon';

const getBlockClassName = (value: BoxRowEntry) => {
  switch (value.value) {
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

export interface GemBoxRowEntry {
  item: Item;
  slotName: JSX.Element;
  value: QualitativePerformance;
  tooltip?: ReactNode; // TODO default tooltip
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
            <div className={styles['gem-block'] + ' ' + getBlockClassName(value)}>
              <Icon icon={value.item.icon} />
            </div>
          </Tooltip>
          {value.slotName}
        </div>
      ))}
    </div>
  );
};

export default GemBoxRow;
