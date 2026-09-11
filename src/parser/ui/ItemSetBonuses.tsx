import { ReactNode } from 'react';
import { type TIER_GEAR_IDS } from 'common/ITEMS';
import ItemSetLink from 'interface/ItemSetLink';

interface Props {
  children: ReactNode;
  setId: TIER_GEAR_IDS;
  title: ReactNode;
  className?: string;
}

const ItemSetBonuses = ({ children, setId, title, className }: Props) => (
  <div className={`pad boring-text ${className || ''}`}>
    <label>
      <ItemSetLink id={setId}>{title}</ItemSetLink>
    </label>
    {children}
  </div>
);

export default ItemSetBonuses;
