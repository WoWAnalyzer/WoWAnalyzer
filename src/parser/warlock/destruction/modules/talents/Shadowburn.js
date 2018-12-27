import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatThousands } from 'common/format';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

import SoulShardTracker from '../soulshards/SoulShardTracker';

/*
  Shadowburn (Tier 30 Destruction talent):
    Blasts a target for X Shadowflame damage. If the target dies within 5 sec and yields experience or honor, Shadowburn's cooldown is reset.
    Generates 3 Soul Shard Fragments.
 */
const FRAGMENTS_PER_CHAOS_BOLT = 20;

class Shadowburn extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
    abilityTracker: AbilityTracker,
  };

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SHADOWBURN_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHADOWBURN_TALENT), this.onShadowburnDamage);
  }

  onShadowburnDamage(event) {
    this.damage += (event.amount || 0) + (event.absorbed || 0);
  }

  subStatistic() {
    const spell = this.abilityTracker.getAbility(SPELLS.CHAOS_BOLT.id);
    const avg = ((spell.damageEffective + spell.damageAbsorbed) / spell.casts) || 0;
    const fragments = this.soulShardTracker.getGeneratedBySpell(SPELLS.SHADOWBURN_TALENT.id);
    const estimatedDamage = Math.floor(fragments / FRAGMENTS_PER_CHAOS_BOLT) * avg;
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.SHADOWBURN_TALENT.id} /> damage</>}
        value={this.owner.formatItemDamageDone(this.damage)}
        valueTooltip={`${formatThousands(this.damage)} damage<br /><br />
          Shadowburn also gave you ${fragments} fragments, and if they were used on Chaos Bolts, they would deal an estimated ${formatThousands(estimatedDamage)} damage (${this.owner.formatItemDamageDone(estimatedDamage)}). This is estimated using average Chaos Bolt damage over the fight.`}
      />
    );
  }
}

export default Shadowburn;
