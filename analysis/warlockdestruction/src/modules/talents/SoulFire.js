import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SPELLS from 'common/SPELLS';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';

import Statistic from 'parser/ui/Statistic';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import SoulShardTracker from '../soulshards/SoulShardTracker';

const FRAGMENTS_PER_CHAOS_BOLT = 20;

class SoulFire extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    soulShardTracker: SoulShardTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SOUL_FIRE_TALENT.id);
  }

  statistic() {
    const fragments = this.soulShardTracker.getGeneratedBySpell(SPELLS.SOUL_FIRE_TALENT.id);

    const chaosBolt = this.abilityTracker.getAbility(SPELLS.CHAOS_BOLT.id);
    const avg = ((chaosBolt.damageEffective + chaosBolt.damageAbsorbed) / chaosBolt.casts) || 0;
    const estimatedDamage = Math.floor(fragments / FRAGMENTS_PER_CHAOS_BOLT) * avg;

    const spell = this.abilityTracker.getAbility(SPELLS.SOUL_FIRE_TALENT.id);
    const damage = spell.damageEffective + spell.damageAbsorbed;
    const dps = damage / this.owner.fightDuration * 1000;

    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={(
          <>
            {formatThousands(damage)} damage<br /><br />

            If fragments generated with Soul Fire were used on Chaos Bolts, they would deal an estimated {formatThousands(estimatedDamage)} damage ({this.owner.formatItemDamageDone(estimatedDamage)}).
            This is estimated using average Chaos Bolt damage over the fight.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.SOUL_FIRE_TALENT}>
          {formatNumber(dps)} DPS <small>{formatPercentage(this.owner.getPercentageOfTotalDamageDone(damage))} % of total</small> <br />
          {fragments} <small>generated Fragments</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SoulFire;
