import { CSSProperties } from 'react';
import * as React from 'react';
import useTooltip from 'interface/useTooltip';

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
    const { itemSet: itemSetTooltip } = useTooltip();
    return (
      <a
        href={itemSetTooltip(id)}
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
