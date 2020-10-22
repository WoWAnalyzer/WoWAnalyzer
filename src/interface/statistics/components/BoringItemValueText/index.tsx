/**
 * A simple component that shows the spell value in the most plain way possible.
 * Use this only as the very last resort.
 */
import React from 'react';

import ItemIcon from 'common/ItemIcon';
import ItemLink from 'common/ItemLink';
import { Item } from 'parser/core/Events';


type Props = {
  item: Item;
  children: React.ReactNode;
  className?: string;
};

const BoringItemValueText = ({ item, children, className }: Props) => (
  <div className={`pad boring-text ${className || ''}`}>
    <label>
      <ItemIcon id={item.id} /> <ItemLink id={item.id} icon={false} />
    </label>
    <div className="value">
      {children}
    </div>
  </div>
);

export default BoringItemValueText;
