import React from 'react';

import { Item } from 'parser/core/Events';
import ITEMS from 'common/ITEMS';

import ItemLink from './ItemLink';
import Icon from './Icon';

type Props = {
  id: number;
  noLink?: boolean;
  details?: Item;
  className?: string;
}

const ItemIcon = ({ id, noLink, details, className }: Props) => {
  const icon = (
    <Icon
      icon={ITEMS[id] ? ITEMS[id].icon : 'inv_misc_questionmark'}
      alt={ITEMS[id] ? ITEMS[id].name : ''}
      className={className}
    />
  );

  if (noLink) {
    return icon;
  }

  return (
    <ItemLink id={id} details={details} icon={false}>
      {icon}
    </ItemLink>
  );
};

export default ItemIcon;
