/**
 * A simple component that shows the spell value in the most plain way possible.
 * Use this only as the very last resort.
 */

import ItemsItem from 'common/ITEMS/Item';
import { ItemLink } from 'interface';
import { Item as EventsItem } from 'parser/core/Events';
import type { ReactNode } from 'react';

interface Props {
  item: EventsItem | ItemsItem;
  children: ReactNode;
  className?: string;
}

const isEventsItem = (item: EventsItem | ItemsItem): item is EventsItem => 'quality' in item;

const BoringItemValueText = ({ item, children, className }: Props) => {
  const itemLinkProps = {
    id: item.id,
    ...(isEventsItem(item) && {
      quality: item.quality,
      details: item,
    }),
  };
  return (
    <div className={`pad boring-text ${className || ''}`}>
      <label>
        <ItemLink {...itemLinkProps} />
      </label>
      <div className="value">{children}</div>
    </div>
  );
};

export default BoringItemValueText;
