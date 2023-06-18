import Spell from 'common/SPELLS/Spell';
import { SpellIcon } from 'interface';
import * as React from 'react';

import './BoringValue.scss';

interface Props {
  spellId: number | Spell;
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
const BoringSpellValue = ({ spellId, value, label, extra, className }: Props) => (
  <div className={`flex boring-value ${className || ''}`}>
    <div className="flex-sub icon">
      <SpellIcon spell={spellId} />
    </div>
    <div className="flex-main value">
      <div>{value}</div>
      <small>{label}</small>
      {extra}
    </div>
  </div>
);

export default BoringSpellValue;
