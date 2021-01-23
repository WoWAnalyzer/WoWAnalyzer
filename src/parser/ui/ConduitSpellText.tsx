import React from 'react';

import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import Spell from 'common/SPELLS/Spell';

type Props = {
  spell: Spell;
  rank: number;
  children: React.ReactNode;
  className?: string;
}

const ConduitSpellText = ({ spell, rank, children, className }: Props) => (
  <div className={`pad boring-text ${className || ''}`}>
    <label>
      <SpellIcon id={spell.id} /> <SpellLink id={spell.id} icon={false} /> - Rank {rank}
    </label>
    <div className="value">
      {children}
    </div>
  </div>
);

export default ConduitSpellText;
