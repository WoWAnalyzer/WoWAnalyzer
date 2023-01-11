/**
 * A simple component that shows the spell value in the most plain way possible.
 * Use this only as the last resort, prefer a custom layout instead.
 */
import Spell from 'common/SPELLS/Spell';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import { ReactNode } from 'react';

interface Props {
  spellId: number | Spell;
  children: ReactNode;
  className?: string;
  ilvl?: number;
}

const BoringSpellValueText = ({ spellId, children, className, ilvl }: Props) => (
  <div className={`pad boring-text ${className || ''}`}>
    <label>
      <SpellIcon id={spellId} /> <SpellLink id={spellId} ilvl={ilvl} icon={false} />
    </label>
    <div className="value">{children}</div>
  </div>
);

export default BoringSpellValueText;
