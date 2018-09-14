import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import { calculateAzeriteEffects } from 'common/stats';
import { formatNumber, formatThousands } from 'common/format';

// Example Log: https://www.warcraftlogs.com/reports/7rLHkgCBhJZ3t1KX#fight=6&type=healing
class SacredFlame extends Analyzer {
  holyFireCasts = 0;
  holyFireTicks = 0;
  holyFireDamage = 0;
  damageBonus = 0;
  manaBonus = 0;
  manaSpentOnHolyFire = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.SACRED_FLAME.id);
    this.ranks = this.selectedCombatant.traitRanks(SPELLS.SACRED_FLAME.id) || [];

    this.damageBonus = this.ranks.map((rank) => calculateAzeriteEffects(SPELLS.SACRED_FLAME.id, rank)[0]).reduce((total, bonus) => total + bonus, 0);
    this.manaBonus = this.ranks.map((rank) => calculateAzeriteEffects(SPELLS.SACRED_FLAME.id, rank, -7)[1]).reduce((total, bonus) => total + bonus, 0);
  }

  get addedDamage() {
    return this.holyFireCasts * this.damageBonus;
  }

  get extraManaRegen() {
    return ((this.holyFireTicks - this.holyFireCasts) * this.manaBonus) - this.manaSpentOnHolyFire;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.HOLY_FIRE.id) {
      if (event.classResources) {
        this.manaSpentOnHolyFire += event.classResources[0].cost;
      }
      this.holyFireCasts++;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.HOLY_FIRE.id) {
      this.holyFireDamage += event.amount;
      this.holyFireTicks++;
    }
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.SACRED_FLAME.id}
        value={(
          <React.Fragment>
            {formatThousands(this.extraManaRegen)} Mana gained<br />
            {formatThousands(this.addedDamage)} Additional Damage
          </React.Fragment>
        )}
        tooltip={`
          ${formatNumber(this.holyFireCasts)} total holy fire cast(s).
        `}
      />
    );
  }
}

export default SacredFlame;
