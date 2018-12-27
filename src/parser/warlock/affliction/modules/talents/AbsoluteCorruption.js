import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';
import SpellLink from 'common/SpellLink';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import Events from 'parser/core/Events';

const AC_DAMAGE_BONUS = 0.15;

class AbsoluteCorruption extends Analyzer {
  bonusDmg = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ABSOLUTE_CORRUPTION_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CORRUPTION_DEBUFF), this.onCorruptionDamage);
  }

  onCorruptionDamage(event) {
    this.bonusDmg += calculateEffectiveDamage(event, AC_DAMAGE_BONUS);
  }

  get dps() {
    return this.bonusDmg / this.owner.fightDuration * 1000;
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.ABSOLUTE_CORRUPTION_TALENT.id} /> bonus damage</>}
        value={this.owner.formatItemDamageDone(this.bonusDmg)}
        valueTooltip={`${formatThousands(this.bonusDmg)} bonus damage<br /><br />
                      Note: This only accounts for the passive 15% increased damage of Corruption. Actual bonus damage should be higher due to saved GCDs.`}
      />
    );
  }
}

export default AbsoluteCorruption;
