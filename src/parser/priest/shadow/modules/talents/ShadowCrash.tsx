import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer from 'parser/core/Analyzer';
import { DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

import ItemDamageDone from 'interface/ItemDamageDone';
import { formatNumber } from 'common/format';
import AbilityTracker from 'parser/priest/shadow/modules/core/AbilityTracker';

// Example Log: /report/zgBQ3kr6aAv19MXq/22-Normal+Zul+-+Kill+(2:26)/3-Selur
class ShadowCrash extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  damage = 0;
  totalTargetsHit = 0;

  get averageTargetsHit() {
    return this.totalTargetsHit / this.abilityTracker.getAbility(SPELLS.SHADOW_CRASH_TALENT.id).casts;
  }

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SHADOW_CRASH_TALENT.id);
  }

  on_byPlayer_damage(event: DamageEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SHADOW_CRASH_TALENT_DAMAGE.id) {
      return;
    }
    this.totalTargetsHit += 1;
    this.damage += event.amount;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`Average targets hit: ${formatNumber(this.averageTargetsHit)}`}
      >
        <BoringSpellValueText spell={SPELLS.SHADOW_CRASH_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ShadowCrash;
