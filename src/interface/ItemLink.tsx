import getItemQualityLabel from 'common/getItemQualityLabel';
import ITEMS from 'common/ITEMS';
import * as React from 'react';
import { AnchorHTMLAttributes } from 'react';

import ItemIcon from './ItemIcon';
import useTooltip from './useTooltip';

interface Props extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'id'> {
  id: number;
  children?: React.ReactNode;
  details?: {
    itemLevel: number;
    quality: number;
  };
  quality?: number;
  icon?: boolean;
}
export const EPIC_ITEMS_ILVL = 184;

const ItemLink = ({ id, children, details, icon = true, quality, ...others }: Props) => {
  const { item: itemTooltip } = useTooltip();

  if (import.meta.env.DEV && !children && !ITEMS[id]) {
    throw new Error(`Unknown item: ${id}`);
  }

  let itemQuality;
  if (quality !== undefined && quality !== null) {
    itemQuality = quality;
  } else if (details) {
    itemQuality = Math.max(details.itemLevel >= EPIC_ITEMS_ILVL ? 4 : 3, details.quality);
  }

  return (
    <a
      href={itemTooltip(id, details)}
      target="_blank"
      rel="noopener noreferrer"
      className={getItemQualityLabel(itemQuality) + 'item-link-text'}
      {...others}
    >
      {icon && (
        <>
          <ItemIcon id={id} noLink />{' '}
        </>
      )}
      {children || ITEMS[id].name}
    </a>
  );
};

export default ItemLink;
