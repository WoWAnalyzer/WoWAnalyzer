import React from 'react';

import ITEMS from './ITEMS';
import ItemLink from './ItemLink';
import Icon from './Icon';

type Props = {
  id: number;
  noLink?: boolean;
  details?: Record<string, any>;
  alt?: string;
}

const ItemIcon = ({ id, noLink, details, alt, ...others }: Props) => {
  const icon = (
    <Icon
      icon={ITEMS[id] ? ITEMS[id].icon : 'inv_misc_questionmark'}
      alt={alt !== '' && ITEMS[id] ? ITEMS[id].name : ''}
      {...others}
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
