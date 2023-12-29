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

const ItemLink = (props: Props) => {
  const { item: itemTooltip } = useTooltip();

  const { id, children, details, ...others } = props;
  delete others.icon;
  delete others.quality;

  if (import.meta.env.DEV && !children && !ITEMS[id]) {
    throw new Error(`Unknown item: ${id}`);
  }

  let quality;
  if (props.quality !== undefined && props.quality !== null) {
    quality = props.quality;
  } else if (props.details) {
    quality = Math.max(props.details.itemLevel >= EPIC_ITEMS_ILVL ? 4 : 3, props.details.quality);
  }

  return (
    <a
      href={itemTooltip(id, details)}
      target="_blank"
      rel="noopener noreferrer"
      className={getItemQualityLabel(quality) + 'item-link-text'}
      {...others}
    >
      {props.icon && (
        <>
          <ItemIcon id={id} noLink />{' '}
        </>
      )}
      {children || ITEMS[id].name}
    </a>
  );
};

ItemLink.defaultProps = { icon: true };

export default ItemLink;
