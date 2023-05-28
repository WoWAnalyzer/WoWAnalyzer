import ITEMS from 'common/ITEMS';
import { Item } from 'parser/core/Events';

import Icon from './Icon';
import ItemLink from './ItemLink';

type Props = {
  id: number;
  noLink?: boolean;
  details?: Item;
  className?: string;
};

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
