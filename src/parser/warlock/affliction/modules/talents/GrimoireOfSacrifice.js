import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage, formatThousands } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SpellLink from 'common/SpellLink';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

class GrimoireOfSacrifice extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GRIMOIRE_OF_SACRIFICE_TALENT.id);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.GRIMOIRE_OF_SACRIFICE_BUFF.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>Your uptime on <SpellLink id={SPELLS.GRIMOIRE_OF_SACRIFICE_TALENT.id} /> is too low. If you picked this talent, you should always have your pet sacrificed. If you died or summoned your pet, make sure to sacrifice it again to gain this buff.</>)
          .icon(SPELLS.GRIMOIRE_OF_SACRIFICE_TALENT.icon)
          .actual(`${formatPercentage(actual)} % Grimoire of Sacrifice uptime.`)
          .recommended(`>= ${formatPercentage(recommended)} % is recommended`);
      });
  }

  subStatistic() {
    const spell = this.abilityTracker.getAbility(SPELLS.GRIMOIRE_OF_SACRIFICE_DAMAGE.id);
    const damage = spell.damageEffective + spell.damageAbsorbed;
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.GRIMOIRE_OF_SACRIFICE_TALENT.id} /> damage</>}
        value={formatThousands(damage)}
        valueTooltip={`${this.owner.formatItemDamageDone(damage)}<br />
          Buff uptime: ${formatPercentage(this.uptime)} %`}
      />
    );
  }
}

export default GrimoireOfSacrifice;
