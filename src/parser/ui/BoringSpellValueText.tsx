/**
 * A simple component that shows the spell value in the most plain way possible.
 * Use this only as the last resort, prefer a custom layout instead.
 */
import Spell from 'common/SPELLS/Spell';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  spell: number | Spell;
  className?: string;
  ilvl?: number;
}

const BoringSpellValueText = ({ spell, children, className, ilvl }: Props) => (
  <div className={`pad boring-text ${className || ''}`}>
    <label>
      <SpellIcon spell={spell} /> <SpellLink spell={spell} ilvl={ilvl} icon={false} />
    </label>
    <div className="value">{children}</div>
  </div>
);

export default BoringSpellValueText;
