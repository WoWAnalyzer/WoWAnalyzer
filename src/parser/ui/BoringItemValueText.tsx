/**
 * A simple component that shows the spell value in the most plain way possible.
 * Use this only as the very last resort.
 */

import { ItemLink } from 'interface';
import { Item } from 'parser/core/Events';
import * as React from 'react';

type Props = {
  item: Item;
  children: React.ReactNode;
  className?: string;
};

const BoringItemValueText = ({ item, children, className }: Props) => (
  <div className={`pad boring-text ${className || ''}`}>
    <label>
      <ItemLink id={item.id} quality={item.quality} details={item} />
    </label>
    <div className="value">{children}</div>
  </div>
);

export default BoringItemValueText;
