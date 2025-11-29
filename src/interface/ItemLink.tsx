import getItemQualityLabel from 'common/getItemQualityLabel';
import ITEMS from 'common/ITEMS';
import type { ReactNode } from 'react';
import { AnchorHTMLAttributes } from 'react';

import ItemIcon from './ItemIcon';
import QualityIcon from './QualityIcon';
import useTooltip from './useTooltip';

interface Props extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'id'> {
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

const ItemLink = ({
  id,
  children,
  details,
  icon = true,
  craftQuality,
  quality: rawQuality,
  ...others
}: Props) => {
  const { item: itemTooltip } = useTooltip();

  if (import.meta.env.DEV && !children && !ITEMS[id]) {
    throw new Error(`Unknown item: ${id}`);
  }

  let quality;
  if (rawQuality !== undefined && rawQuality !== null) {
    quality = rawQuality;
  } else if (details?.quality) {
    quality = details.quality;
  }

  return (
    <a
      href={itemTooltip(id, details)}
      target="_blank"
      rel="noopener noreferrer"
      className={getItemQualityLabel(quality) + 'item-link-text'}
      {...others}
    >
      {icon && (
        <>
          <ItemIcon id={id} noLink />{' '}
        </>
      )}
      {children || ITEMS[id]?.name}
      {craftQuality ? <QualityIcon quality={craftQuality} /> : null}
    </a>
  );
};

export default ItemLink;
