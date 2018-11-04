import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatThousands } from 'common/format';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

import SoulShardTracker from '../soulshards/SoulShardTracker';

const FRAGMENTS_PER_CHAOS_BOLT = 20;
const FRAGMENTS_PER_RAIN_OF_FIRE = 30;

/*
    Inferno (Tier 60 Destruction talent):
      Rain of Fire damage has a 20% chance to generate a Soul Shard Fragment.
 */
class Inferno extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
    abilityTracker: AbilityTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.INFERNO_TALENT.id);
  }

  get averageRainOfFireDamage() {
    // Rain of Fire has different spellId for cast and damage but AbilityTracker picks up both of them
    const rofDamage = this.abilityTracker.getAbility(SPELLS.RAIN_OF_FIRE_DAMAGE.id);
    const rofCast = this.abilityTracker.getAbility(SPELLS.RAIN_OF_FIRE_CAST.id);
    return ((rofDamage.damageEffective + rofDamage.damageAbsorbed) / rofCast.casts) || 0;
  }

  get averageChaosBoltDamage() {
    const chaosBolt = this.abilityTracker.getAbility(SPELLS.CHAOS_BOLT.id);
    return ((chaosBolt.damageEffective + chaosBolt.damageAbsorbed) / chaosBolt.casts) || 0;
  }

  subStatistic() {
    // ESTIMATED fragments from Rain of Fire, see comments in SoulShardTracker._getRandomFragmentDistribution()
    const fragments = this.soulShardTracker.getGeneratedBySpell(SPELLS.RAIN_OF_FIRE_DAMAGE.id);
    const estimatedRofDamage = Math.floor(fragments / FRAGMENTS_PER_RAIN_OF_FIRE) * this.averageRainOfFireDamage;
    const estimatedChaosBoltDamage = Math.floor(fragments / FRAGMENTS_PER_CHAOS_BOLT) * this.averageChaosBoltDamage;
    return (
      <StatisticListBoxItem
        title={<><strong>Estimated</strong> bonus fragments from <SpellLink id={SPELLS.INFERNO_TALENT.id} /></>}
        value={fragments}
        valueTooltip={`While majority of sources of Soul Shard Fragments are certain, chance based sources (Inferno and Immolate crits) make tracking the fragments 100% correctly impossible (fragment generation is NOT in logs).<br /><br />
            If you used all these bonus fragments on Chaos Bolts, they would do ${formatThousands(estimatedChaosBoltDamage)} damage (${this.owner.formatItemDamageDone(estimatedChaosBoltDamage)}).<br />
            If you used them on Rain of Fires, they would do ${formatThousands(estimatedRofDamage)} damage (${this.owner.formatItemDamageDone(estimatedRofDamage)}).<br />
            Both of these estimates are based on average damage of respective spells during the fight.`}
      />
    );
  }
}

export default Inferno;
