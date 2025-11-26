import type { HTMLAttributes, ReactNode } from 'react';
import { CSSProperties } from 'react';
import Spell from 'common/SPELLS/Spell';

import SpellIcon from './SpellIcon';
import useSpellInfo from './useSpellInfo';
import useTooltip from './useTooltip';
import { getSpellId } from 'common/getSpellId';

interface Props extends Omit<HTMLAttributes<HTMLAnchorElement>, 'id'> {
  spell: number | Spell;
  children?: ReactNode;
  icon?: boolean;
  iconStyle?: CSSProperties;
  ilvl?: number;
  rank?: number;
  def?: number;
}

const SpellLink = ({
  ref,
  spell,
  children,
  icon = true,
  iconStyle,
  ilvl,
  def,
  rank,
  ...other
}: Props & { ref?: React.RefObject<HTMLAnchorElement | null> }) => {
  const spellData = spell;
  const spellId = getSpellId(spellData);
  const spellInfo = useSpellInfo(spellData);
  const { spell: spellTooltip } = useTooltip();

  return (
    <a
      href={spellTooltip(spellId, { ilvl, rank, def })}
      target="_blank"
      rel="noopener noreferrer"
      ref={ref}
      className="spell-link-text"
      {...other}
    >
      {icon && (
        <>
          <SpellIcon spell={spellData} noLink style={iconStyle} alt="" />{' '}
        </>
      )}
      {children || (spellInfo?.name ? spellInfo.name : `Unknown spell: ${spellId}`)}
    </a>
  );
};

export default SpellLink;
