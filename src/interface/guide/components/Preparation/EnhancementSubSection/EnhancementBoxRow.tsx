import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { CSSProperties, ReactNode } from 'react';
import { Tooltip } from 'interface/index';
import Icon from 'interface/Icon';
import { Item } from 'parser/core/Events';

import styles from './EnhancementBoxRow.module.scss';

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

export interface EnhancementBoxRowEntry {
  item: Item;
  slotName: JSX.Element;
  value: QualitativePerformance;
  tooltip?: ReactNode; // TODO default tooltip
}

interface Props {
  values: EnhancementBoxRowEntry[];
  style?: CSSProperties;
}
const EnhancementBoxRow = ({ values }: Props) => {
  return (
    <div className={styles['enhancement-block-row']}>
      {values.map((value, ix) => (
        <div className={styles['enhancement-block-column']} key={ix}>
          <Tooltip content={value.tooltip}>
            <div className={styles['enhancement-block'] + ' ' + getBlockClassName(value)}>
              <Icon icon={value.item.icon} />
            </div>
          </Tooltip>
          {value.slotName}
        </div>
      ))}
    </div>
  );
};

export default EnhancementBoxRow;
