import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import { calculateAzeriteEffects } from 'common/stats';
import calculateBonusAzeriteDamage from 'parser/core/calculateBonusAzeriteDamage';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import StatTracker from 'parser/shared/modules/StatTracker';

const ES_SP_COEFFICIENT = 2.1;// taken from Simcraft SpellDataDump (250% -> 210% in 8.1)

class LavaShock extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  procs = 0;
  damageGained = 0;
  traitBonus = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.LAVA_SHOCK.id);
    if (!this.active) {
      return;
    }
    this.traitBonus = this.selectedCombatant.traitsBySpellId[SPELLS.LAVA_SHOCK.id]
      .reduce((sum, rank) => sum + calculateAzeriteEffects(SPELLS.LAVA_SHOCK.id, rank)[0], 0);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.EARTH_SHOCK.id) {
      return;
    }
    const buff = this.selectedCombatant.getBuff(SPELLS.LAVA_SHOCK_BUFF.id);
    if (buff === undefined) {
      return;
    }
    const [bonusDamage] = calculateBonusAzeriteDamage(event, [this.traitBonus], ES_SP_COEFFICIENT, this.statTracker.currentIntellectRating);
    this.damageGained += bonusDamage;
    this.procs += 1;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.LAVA_SHOCK.id}
        value={<ItemDamageDone amount={this.damageGained} />}
        tooltip={`Lava Shock did ${formatNumber(this.damageGained)} damage with ${formatNumber(this.procs)} procs.`}
      />
    );
  }
}

export default LavaShock;
