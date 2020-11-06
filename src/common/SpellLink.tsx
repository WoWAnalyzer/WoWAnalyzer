import React from 'react';

import TooltipProvider from 'interface/common/TooltipProvider';

import SPELLS from './SPELLS';
import SpellIcon from './SpellIcon';

interface Props extends Omit<React.HTMLAttributes<HTMLAnchorElement>, 'id'> {
  id: number,
  children?: React.ReactNode,
  icon?: boolean,
  iconStyle?: object,
  ilvl?: number,
}

const SpellLink = React.forwardRef<HTMLAnchorElement, Props>(({
  id,
  children,
  icon= true,
  iconStyle,
  ilvl,
  ...other
}: Props, ref) => {
  if (process.env.NODE_ENV === 'development' && !children && !SPELLS[id]) {
    throw new Error(`Unknown spell: ${id}`);
  }

  return (
    <a
      href={TooltipProvider.spell(id, ilvl ? { ilvl } : undefined)}
      target="_blank"
      rel="noopener noreferrer"
      ref={ref}
      className='spell-link-text'
      {...other}
    >
      {icon && <><SpellIcon id={id} noLink style={iconStyle} alt="" /> </>}
      {children || (SPELLS[id] ? SPELLS[id].name : `Unknown spell: ${id}`)}
    </a>
  );
});

export default SpellLink;
