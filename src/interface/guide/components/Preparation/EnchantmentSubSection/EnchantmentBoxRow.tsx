import styles from './EnchantmentBoxRow.module.scss';
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

export interface EnchantmentBoxRowEntry {
  item: Item;
  slotName: JSX.Element;
  value: QualitativePerformance;
  tooltip?: ReactNode; // TODO default tooltip
}

interface EnchantmentBoxRowProps {
  values: EnchantmentBoxRowEntry[];
  style?: CSSProperties;
}
const EnchantmentBoxRow = ({ values }: EnchantmentBoxRowProps) => {
  return (
    <div className={styles['enchantment-block-row']}>
      {values.map((value, ix) => (
        <div className={styles['enchantment-block-column']} key={ix}>
          <Tooltip content={value.tooltip}>
            <div className={styles['enchantment-block'] + ' ' + getBlockClassName(value)}>
              <Icon icon={value.item.icon} />
            </div>
          </Tooltip>
          {value.slotName}
        </div>
      ))}
    </div>
  );
};

export default EnchantmentBoxRow;
