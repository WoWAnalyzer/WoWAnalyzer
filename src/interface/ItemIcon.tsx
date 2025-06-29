import ITEMS from 'common/ITEMS';
import { Item } from 'parser/core/Events';

import Icon from './Icon';
import ItemLink from './ItemLink';

interface Props {
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

  // Negative item IDs are used for items that don't exist in the game as items but fit the item usage pattern
  // , example being the empty gem socket, so they don't have a Wowhead link
  if (noLink || id < 0) {
    return icon;
  }

  return (
    <ItemLink id={id} details={details} icon={false}>
      {icon}
    </ItemLink>
  );
};

export default ItemIcon;
