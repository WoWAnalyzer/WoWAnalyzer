import Spell from 'common/SPELLS/Spell';
import { SpellIcon } from 'interface';
import React from 'react';

import './BoringValue.scss';

interface Props {
  spell: Spell;
  value: React.ReactNode;
  label: React.ReactNode;
  extra?: React.ReactNode;
  className?: string;
}

/**
 * A simple component that shows the spell icon left and a value right.
 * Use this only for things that the player certainly should be familiar with, such as their own spells.
 * Do NOT use for items.
 */
const BoringSpellValue = ({ spell, value, label, extra, className }: Props) => (
  <div className={`flex boring-value ${className || ''}`}>
    <div className="flex-sub icon">
      <SpellIcon id={spell.id} />
    </div>
    <div className="flex-main value">
      <div>{value}</div>
      <small>{label}</small>
      {extra}
    </div>
  </div>
);

export default BoringSpellValue;
