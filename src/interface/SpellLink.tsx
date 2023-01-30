import * as React from 'react';
import { CSSProperties } from 'react';
import Spell from 'common/SPELLS/Spell';

import SpellIcon from './SpellIcon';
import useSpellInfo from './useSpellInfo';
import useTooltip from './useTooltip';

interface Props extends Omit<React.HTMLAttributes<HTMLAnchorElement>, 'id'> {
  id: number | Spell;
  children?: React.ReactNode;
  icon?: boolean;
  iconStyle?: CSSProperties;
  ilvl?: number;
  rank?: number;
}

const SpellLink = React.forwardRef<HTMLAnchorElement, Props>(
  ({ id: spell, children, icon = true, iconStyle, ilvl, rank, ...other }: Props, ref) => {
    const spellId = typeof spell === 'number' ? spell : spell.id;
    const spellInfo = useSpellInfo(spell);
    const { spell: spellTooltip } = useTooltip();

    return (
      <a
        href={spellTooltip(spellId, { ilvl, rank })}
        target="_blank"
        rel="noopener noreferrer"
        ref={ref}
        className="spell-link-text"
        {...other}
      >
        {icon && (
          <>
            <SpellIcon id={spell} noLink style={iconStyle} alt="" />{' '}
          </>
        )}
        {children || (spellInfo?.name ? spellInfo.name : `Unknown spell: ${spellId}`)}
      </a>
    );
  },
);

export default SpellLink;
