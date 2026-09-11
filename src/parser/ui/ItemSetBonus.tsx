import { ReactNode } from 'react';
import styles from './ItemSetBonus.module.scss';

interface Props {
  pieces: 2 | 4;
  children: ReactNode;
  label?: ReactNode;
  footnote?: ReactNode;
}

const ItemSetBonus = ({ pieces, children, label, footnote }: Props) => (
  <div className={styles.bonus}>
    <div>
      <strong>{pieces}-piece</strong>
      {label && <> {label}</>}:
    </div>
    <div className="value">{children}</div>
    {footnote && <small className={styles.footnote}>{footnote}</small>}
  </div>
);

export default ItemSetBonus;
