import { ReactNode } from 'react';
import { type TIER_GEAR_IDS } from 'common/ITEMS/dragonflight';
import ItemSetLink from 'interface/ItemSetLink';

interface Props {
  children: ReactNode;
  setId: TIER_GEAR_IDS;
  title: ReactNode;
  className?: string;
}

const BoringItemSetValueText = ({ children, setId, title, className }: Props) => (
  <div className={`pad boring-text ${className || ''}`}>
    <label>
      <ItemSetLink id={setId}>{title}</ItemSetLink>
    </label>
    <div className="value">{children}</div>
  </div>
);

export default BoringItemSetValueText;
