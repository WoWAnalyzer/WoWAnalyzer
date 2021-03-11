/**
 * A simple component that shows the spell value in the most plain way possible.
 * Use this only as the very last resort.
 */

import { ItemIcon } from 'interface';
import { ItemLink } from 'interface';
import { Item } from 'parser/core/Events';
import React from 'react';

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
    <div className="value">{children}</div>
  </div>
);

export default BoringItemValueText;
