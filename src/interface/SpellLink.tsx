import TooltipProvider from 'interface/TooltipProvider';
import { CSSProperties } from 'react';
import * as React from 'react';

import SpellIcon from './SpellIcon';
import useSpellInfo from './useSpellInfo';

interface Props extends Omit<React.HTMLAttributes<HTMLAnchorElement>, 'id'> {
  id: number;
  children?: React.ReactNode;
  icon?: boolean;
  iconStyle?: CSSProperties;
  ilvl?: number;
  rank?: number;
}

const SpellLink = React.forwardRef<HTMLAnchorElement, Props>(
  ({ id: spellId, children, icon = true, iconStyle, ilvl, rank, ...other }: Props, ref) => {
    const spell = useSpellInfo(spellId);

    return (
      <a
        href={TooltipProvider.spell(spellId, { ilvl, rank })}
        target="_blank"
        rel="noopener noreferrer"
        ref={ref}
        className="spell-link-text"
        {...other}
      >
        {icon && (
          <>
            <SpellIcon id={spellId} noLink style={iconStyle} alt="" />{' '}
          </>
        )}
        {children || (spell ? spell.name : `Unknown spell: ${spellId}`)}
      </a>
    );
  },
);

export default SpellLink;
