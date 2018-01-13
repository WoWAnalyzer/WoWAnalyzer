import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';
import Wrapper from 'common/Wrapper';

import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Combatants from 'Parser/Core/Modules/Combatants';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class AuraOfSacrifice extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.AURA_OF_SACRIFICE_TALENT.id);
  }

  get healing() {
    const abilityTracker = this.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    return getAbility(SPELLS.AURA_OF_SACRIFICE_HEAL.id).healingEffective + getAbility(SPELLS.AURA_OF_SACRIFICE_HEAL.id).healingAbsorbed;
  }
  get hps() {
    return this.healing / this.owner.fightDuration * 1000;
  }

  get suggestionThresholds() {
    return {
      actual: this.hps,
      isLessThan: {
        minor: 80000,
        average: 60000,
        major: 40000,
      },
      style: 'number',
      suffix: 'HPS',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <Wrapper>
          The healing done by your <SpellLink id={SPELLS.AURA_OF_SACRIFICE_TALENT.id} icon /> is low. Try to find a better moment to cast it, improve your usage or consider changing to <SpellLink id={SPELLS.AURA_OF_MERCY_TALENT.id} icon /> or <SpellLink id={SPELLS.DEVOTION_AURA_TALENT.id} icon /> which can be more reliable and often do as much healing with less effort.
        </Wrapper>
      )
        .icon(SPELLS.AURA_OF_SACRIFICE_TALENT.icon)
        .actual(`${formatNumber(actual)} HPS`)
        .recommended(`>${formatNumber(recommended)} HPS is recommended`);
    });
  }
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.AURA_OF_SACRIFICE_TALENT.id} />}
        value={`${formatNumber(this.hps)} HPS`}
        label="Healing done"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(60);
}

export default AuraOfSacrifice;
