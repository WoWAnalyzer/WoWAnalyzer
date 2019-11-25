import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer from 'parser/core/Analyzer';
import TalentStatisticBox, { STATISTIC_ORDER } from 'interface/others/TalentStatisticBox';

import ItemDamageDone from 'interface/others/ItemDamageDone';
import { formatNumber } from 'common/format';
import AbilityTracker from 'parser/priest/shadow/modules/core/AbilityTracker';

// Example Log: /report/zgBQ3kr6aAv19MXq/22-Normal+Zul+-+Kill+(2:26)/3-Selur
class ShadowCrash extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  damage = 0;
  totalTargetsHit = 0;

  get averageTargetsHit() {
    return this.totalTargetsHit / this.abilityTracker.getAbility(SPELLS.SHADOW_CRASH_TALENT.id).casts;
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SHADOW_CRASH_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SHADOW_CRASH_TALENT_DAMAGE.id) {
      return;
    }
    this.totalTargetsHit += 1;
    this.damage += event.amount;
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.SHADOW_CRASH_TALENT.id}
        value={<ItemDamageDone amount={this.damage} />}
        tooltip={`Average targets hit: ${formatNumber(this.averageTargetsHit)}`}
        position={STATISTIC_ORDER.CORE(5)}
      />
    );
  }
}

export default ShadowCrash;
