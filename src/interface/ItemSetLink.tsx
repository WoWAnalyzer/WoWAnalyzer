import { CSSProperties } from 'react';
import * as React from 'react';

interface Props extends Omit<React.HTMLAttributes<HTMLAnchorElement>, 'id'> {
  id: number;
  children?: React.ReactNode;
  icon?: boolean;
  iconStyle?: CSSProperties;
  ilvl?: number;
  rank?: number;
}

const ItemSetLink = React.forwardRef<HTMLAnchorElement, Props>(
  ({ id, children, icon = true, iconStyle, ilvl, rank, ...other }: Props, ref) => {
    return (
      <a
        href={TooltipProvider.itemSet(id, undefined)}
        target="_blank"
        rel="noopener noreferrer"
        ref={ref}
        className="spell-link-text"
        {...other}
      >
        {children || 'Unspecified Item Set'}
      </a>
    );
  },
);

export default ItemSetLink;
