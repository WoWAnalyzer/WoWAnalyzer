import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import { calculateAzeriteEffects } from 'common/stats';
import { formatThousands } from 'common/format';
import ItemHealingDone from 'Interface/Others/ItemHealingDone';

// Example Log: https://www.warcraftlogs.com/reports/aTBGZk3w4q1JQrKW#fight=5&type=summary&source=9&translate=true
class Sanctum extends Analyzer {
  sanctumAbsormAmount = 0;
  fadeCount = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.SANCTUM_TRAIT.id);
    this.ranks = this.selectedCombatant.traitRanks(SPELLS.SANCTUM_TRAIT.id) || [];

    this.sanctumShieldSize = this.ranks.map((rank) => calculateAzeriteEffects(SPELLS.SANCTUM_TRAIT.id, rank)[0]).reduce((total, bonus) => total + bonus, 0);
  }

  on_byPlayer_absorbed(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.SANCTUM_ABSORB.id) {
      this.sanctumAbsormAmount += event.amount;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.FADE.id) {
      this.fadeCount++;
    }
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.SANCTUM_TRAIT.id}
        value={(
          <React.Fragment>
            <ItemHealingDone amount={this.sanctumAbsormAmount} /><br />
          </React.Fragment>
        )}
        tooltip={`
          ${formatThousands(this.fadeCount)} Fade Casts<br />
          ${formatThousands(this.sanctumAbsormAmount)} Total Shielding
        `}
      />
    );
  }
}

export default Sanctum;
