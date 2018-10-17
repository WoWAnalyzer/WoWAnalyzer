import React from 'react';

import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'parser/core/Analyzer';
import TalentStatisticBox, { STATISTIC_ORDER } from 'interface/others/TalentStatisticBox';

import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import { formatNumber } from 'common/format';

// Example Log: /report/zgBQ3kr6aAv19MXq/22-Normal+Zul+-+Kill+(2:26)/3-Selur
class ShadowCrash extends Analyzer {
  casts = 0;
  damage = 0;
  totalTargetsHit = 0;

  get averageTargetsHit() {
    return this.totalTargetsHit / this.casts;
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SHADOW_CRASH_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SHADOW_CRASH_TALENT.id) {
      return;
    }

    this.casts++;
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
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.SHADOW_CRASH_TALENT.id} />}
        value={(
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        )}
        label={`${SPELLS.SHADOW_CRASH_TALENT.name}`}
        tooltip={`Average targets hit: ${formatNumber(this.averageTargetsHit)}`}
        position={STATISTIC_ORDER.CORE(1)}
      />
    );
  }
}

export default ShadowCrash;
