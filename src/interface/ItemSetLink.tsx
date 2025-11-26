import type { HTMLAttributes, ReactNode } from 'react';
import { CSSProperties } from 'react';
import useTooltip from 'interface/useTooltip';

interface Props extends Omit<HTMLAttributes<HTMLAnchorElement>, 'id'> {
  id: number;
  children?: ReactNode;
  icon?: boolean;
  iconStyle?: CSSProperties;
  ilvl?: number;
  rank?: number;
}

const ItemSetLink = ({
  ref,
  id,
  children,
  icon = true,
  iconStyle,
  ilvl,
  rank,
  ...other
}: Props & { ref?: React.RefObject<HTMLAnchorElement | null> }) => {
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
};

export default ItemSetLink;
