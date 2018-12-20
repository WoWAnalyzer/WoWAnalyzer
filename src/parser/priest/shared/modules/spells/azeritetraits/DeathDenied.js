import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox from 'interface/others/TraitStatisticBox';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import { formatNumber } from 'common/format';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import SpellUsable from 'parser/priest/holy/modules/features/SpellUsable';

/*
  Leap of Faith absorbs the next 10736 damage to the target within 10 sec. While the shield holds, Leap of Faith cools down 200% faster.
  Example Log: /report/m8yDrYW2TG6BcVtC/4-Heroic+MOTHER+-+Kill+(3:42)/5-Azzil
 */
class DeathDenied extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  shieldAppliedTimestamp = 0;
  cooldownTimeReduced = 0;
  damageAbsorbed = 0;

  constructor(...args) {
    super(...args);

    this.active = this.selectedCombatant.hasTrait(SPELLS.DEATH_DENIED.id);

    if (this.active) {
      this.ranks = this.selectedCombatant.traitRanks(SPELLS.DEATH_DENIED.id) || [];
      this.deathDeniedProcAmount = this.ranks.map((rank) => calculateAzeriteEffects(SPELLS.DEATH_DENIED.id, rank)[0]).reduce((total, bonus) => total + bonus, 0);
    }
  }

  on_byPlayer_absorbed(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DEATH_DENIED_SHIELD_BUFF.id) {
      this.damageAbsorbed += event.amount;
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DEATH_DENIED_SHIELD_BUFF.id) {
      this.shieldAppliedTimestamp = event.timestamp;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DEATH_DENIED_SHIELD_BUFF.id) {
      const cooldownReductionAmount = (event.timestamp - this.shieldAppliedTimestamp) * 2;

      this.cooldownTimeReduced += cooldownReductionAmount;

      if (this.spellUsable.isOnCooldown(SPELLS.LEAP_OF_FAITH.id)) {
        this.spellUsable.reduceCooldown(SPELLS.LEAP_OF_FAITH.id, cooldownReductionAmount, event.timestamp);
      }
    }
  }

  statistic() {
    return (
      <TraitStatisticBox
        trait={SPELLS.DEATH_DENIED.id}
        value={<ItemHealingDone amount={this.damageAbsorbed} />}
        tooltip={`
          ${formatNumber(this.damageAbsorbed)} damage absorbed.<br />
          ${SPELLS.LEAP_OF_FAITH.name} cooldown reduced by ${Math.floor(this.cooldownTimeReduced / 1000)} seconds.
        `}
      />
    );
  }
}

export default DeathDenied;
