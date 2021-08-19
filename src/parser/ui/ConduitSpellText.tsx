import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import React, { ReactNode } from 'react';

interface Props {
  spellId: number;
  rank: number;
  children: ReactNode;
  className?: string;
}

const ConduitSpellText = ({ spellId, rank, children, className }: Props) => (
  <div className={`pad boring-text ${className || ''}`}>
    <label>
      <SpellIcon id={spellId} /> <SpellLink id={spellId} icon={false} /> - Rank {rank}
    </label>
    <div className="value">{children}</div>
  </div>
);

export default ConduitSpellText;
