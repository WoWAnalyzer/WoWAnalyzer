import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import { calculateAzeriteEffects } from 'common/stats';
import { formatNumber, formatThousands } from 'common/format';
import SanctifyReduction from 'Parser/Priest/Holy/Modules/PriestCore/HolyWords/ReductionCalculators/SanctifyReduction';
import ItemHealingDone from 'Interface/Others/ItemHealingDone';

// Example Log: https://www.warcraftlogs.com/reports/7rLHkgCBhJZ3t1KX#fight=6&type=healing
class WordOfMending extends Analyzer {
  static dependencies = {
    sanctify: SanctifyReduction,
  };

  totalWoM = 0;
  healingBonus = 0;
  totalAdditionalHealing = 0;
  totalAdditionalOverHealing = 0;
  totalCooldownReduction = 0;
  totalCooldownReductionWasted = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.WORD_OF_MENDING.id);
    this.ranks = this.selectedCombatant.traitRanks(SPELLS.WORD_OF_MENDING.id) || [];

    this.healingBonus = this.ranks.map((rank) => calculateAzeriteEffects(SPELLS.WORD_OF_MENDING.id, rank)[0]).reduce((total, bonus) => total + bonus, 0);
    this.totalWoM = this.ranks.length;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.PRAYER_OF_MENDING_HEAL.id) {
      let eventHealing = this.healingBonus;
      let eventOverhealing = 0;

      if (event.overheal) {
        eventOverhealing = Math.min(this.healingBonus, event.overheal);
        eventHealing -= eventOverhealing;
      }

      this.totalAdditionalHealing += eventHealing;
      this.totalAdditionalOverHealing += eventOverhealing;
    }
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.WORD_OF_MENDING.id}
        value={(
          <React.Fragment>
            <ItemHealingDone amount={this.totalAdditionalHealing} /><br />
            {formatNumber(this.sanctify.reductionBySpell[SPELLS.PRAYER_OF_MENDING_CAST.id]/1000)}s Sanctify Cooldown
          </React.Fragment>
        )}
        tooltip={`
          ${formatThousands(this.totalAdditionalHealing)} Total Healing
        `}
      />
    );
  }
}

export default WordOfMending;
