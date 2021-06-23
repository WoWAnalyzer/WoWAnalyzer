import TooltipProvider from 'interface/TooltipProvider';
import React, { CSSProperties } from 'react';

import SpellIcon from './SpellIcon';
import useSpellInfo from './useSpellInfo';

interface Props extends Omit<React.HTMLAttributes<HTMLAnchorElement>, 'id'> {
  id: number;
  children?: React.ReactNode;
  icon?: boolean;
  iconStyle?: CSSProperties;
  ilvl?: number;
}

const SpellLink = React.forwardRef<HTMLAnchorElement, Props>(
  ({ id, children, icon = true, iconStyle, ilvl, ...other }: Props, ref) => {
    const spell = useSpellInfo(id);

    return (
      <a
        href={TooltipProvider.spell(id, ilvl ? { ilvl } : undefined)}
        target="_blank"
        rel="noopener noreferrer"
        ref={ref}
        className="spell-link-text"
        {...other}
      >
        {icon && (
          <>
            <SpellIcon id={id} noLink style={iconStyle} alt="" />{' '}
          </>
        )}
        {children || (spell ? spell.name : `Unknown spell: ${id}`)}
      </a>
    );
  },
);

export default SpellLink;
