import React from 'react';

import ITEMS from './ITEMS';
import ItemLink from './ItemLink';
import Icon from './Icon';

type Props = {
  id: number;
  noLink?: boolean;
  className?: string;
}

const ItemIcon = ({ id, noLink, className }: Props) => {
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
    <ItemLink id={id} icon={false}>
      {icon}
    </ItemLink>
  );
};

export default ItemIcon;
