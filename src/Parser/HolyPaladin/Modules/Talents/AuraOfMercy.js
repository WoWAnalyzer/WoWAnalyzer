import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';

import Module from 'Parser/Core/Module';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class AuraOfMercy extends Module {
  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTalent(SPELLS.AURA_OF_MERCY_TALENT.id);
    }
  }

  get healing() {
    const abilityTracker = this.owner.modules.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    return (getAbility(SPELLS.AURA_OF_MERCY_HEAL.id).healingEffective + getAbility(SPELLS.AURA_OF_MERCY_HEAL.id).healingAbsorbed);
  }

  suggestions(when) {
    when(this.auraOfSacrificeHps).isLessThan(30000)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>The healing done by your <SpellLink id={SPELLS.AURA_OF_SACRIFICE_TALENT.id} /> is low. Try to find a better moment to cast it or consider changing to <SpellLink id={SPELLS.AURA_OF_MERCY_TALENT.id} /> or <SpellLink id={SPELLS.DEVOTION_AURA_TALENT.id} /> which can be more reliable.</span>)
          .icon(SPELLS.AURA_OF_SACRIFICE_TALENT.icon)
          .actual(`${formatNumber(actual)} HPS`)
          .recommended(`>${formatNumber(recommended)} HPS is recommended`)
          .regular(recommended - 5000).major(recommended - 10000);
      });
  }
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.AURA_OF_MERCY_TALENT.id} />}
        value={`${formatNumber(this.healing / this.owner.fightDuration * 1000)} HPS`}
        label="Healing done"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default AuraOfMercy;
