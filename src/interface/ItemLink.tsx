import getItemQualityLabel from 'common/getItemQualityLabel';
import ITEMS from 'common/ITEMS';
import { ComponentPropsWithoutRef, ReactNode } from 'react';
import { isPresent } from 'common/typeGuards';

import ItemIcon from './ItemIcon';
import QualityIcon from './QualityIcon';
import useTooltip from './useTooltip';

interface Props extends Omit<ComponentPropsWithoutRef<'a'>, 'id'> {
  id: number;
  children?: ReactNode;
  details?: {
    itemLevel: number;
    quality: number;
  };
  quality?: number;
  icon?: boolean;
  craftQuality?: 1 | 2 | 3 | 4 | 5;
}
export const EPIC_ITEMS_ILVL = 184;

const ItemLink = ({
  id,
  children,
  details,
  craftQuality,
  quality,
  icon = true,
  ...others
}: Props) => {
  const { item: itemTooltip } = useTooltip();

  if (import.meta.env.DEV && !children && !ITEMS[id]) {
    throw new Error(`Unknown item: ${id}`);
  }

  let qual;
  if (isPresent(quality)) {
    qual = quality;
  } else if (details) {
    qual = Math.max(details.itemLevel >= EPIC_ITEMS_ILVL ? 4 : 3, details.quality);
  }

  return (
    <a
      href={itemTooltip(id, details)}
      target="_blank"
      rel="noopener noreferrer"
      className={getItemQualityLabel(qual) + 'item-link-text'}
      {...others}
    >
      {icon && (
        <>
          <ItemIcon id={id} noLink />{' '}
        </>
      )}
      {children || ITEMS[id].name}
      {craftQuality ? <QualityIcon quality={craftQuality} /> : null}
    </a>
  );
};

export default ItemLink;
