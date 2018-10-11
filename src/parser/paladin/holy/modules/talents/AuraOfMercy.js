import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

class AuraOfMercy extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.AURA_OF_MERCY_TALENT.id);
  }

  get healing() {
    const abilityTracker = this.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    return (getAbility(SPELLS.AURA_OF_MERCY_HEAL.id).healingEffective + getAbility(SPELLS.AURA_OF_MERCY_HEAL.id).healingAbsorbed);
  }
  get hps() {
    return this.healing / this.owner.fightDuration * 1000;
  }

  get suggestionThresholds() {
    return {
      actual: this.hps,
      isLessThan: {
        minor: 600,
        average: 550,
        major: 500,
      },
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          The healing done by your <SpellLink id={SPELLS.AURA_OF_MERCY_TALENT.id} /> is low. Try to find a better moment to cast it or consider changing to <SpellLink id={SPELLS.AURA_OF_SACRIFICE_TALENT.id} /> or <SpellLink id={SPELLS.DEVOTION_AURA_TALENT.id} /> which can be more reliable.
        </>
      )
        .icon(SPELLS.AURA_OF_MERCY_TALENT.icon)
        .actual(`${formatNumber(actual)} HPS`)
        .recommended(`>${formatNumber(recommended)} HPS is recommended`);
    });
  }
  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL(60)}
        icon={<SpellIcon id={SPELLS.AURA_OF_MERCY_TALENT.id} />}
        value={`${formatNumber(this.hps)} HPS`}
        label="Healing done"
      />
    );
  }
}

export default AuraOfMercy;
