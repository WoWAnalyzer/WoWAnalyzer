/**
 * A simple component that shows the spell value in the most plain way possible.
 * Use this only as the very last resort.
 */
import Spell from 'common/SPELLS/Spell';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import React from 'react';

type Props = {
  spell: Spell;
  children: React.ReactNode;
  className?: string;
  ilvl?: number;
};

const BoringSpellValueText = ({ spell, children, className, ilvl }: Props) => (
  <div className={`pad boring-text ${className || ''}`}>
    <label>
      <SpellIcon id={spell.id} /> <SpellLink id={spell.id} ilvl={ilvl} icon={false} />
    </label>
    <div className="value">{children}</div>
  </div>
);

export default BoringSpellValueText;
