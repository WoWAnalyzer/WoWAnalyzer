import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
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

  damage: number = 0;
  totalTargetsHit: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SHADOW_CRASH_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_CRASH_TALENT_DAMAGE), this.onShadowCrashDamage);
  }

  get averageTargetsHit() {
    return this.totalTargetsHit / this.abilityTracker.getAbility(SPELLS.SHADOW_CRASH_TALENT.id).casts;
  }

  onShadowCrashDamage(event: DamageEvent) {
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
