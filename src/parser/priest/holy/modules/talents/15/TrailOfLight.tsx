import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemHealingDone from 'interface/ItemHealingDone';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

// Example Log: /report/hRd3mpK1yTQ2tDJM/1-Mythic+MOTHER+-+Kill+(2:24)/14-丶寶寶小喵
class TrailOfLight extends Analyzer {
  totalToLProcs = 0;
  totalToLHealing = 0;
  totalToLOverhealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.TRAIL_OF_LIGHT_TALENT.id);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.TRAIL_OF_LIGHT_HEAL), this.onHeal);
  }

  onHeal(event: HealEvent) {
    this.totalToLProcs += 1;
    this.totalToLHealing += event.overheal || 0;
    this.totalToLOverhealing += (event.amount || 0);
  }

  statistic() {
    return (
      <Statistic
        tooltip={`Trail of Light Procs: ${this.totalToLProcs}`}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(1)}
      >
        <BoringSpellValueText spell={SPELLS.TRAIL_OF_LIGHT_TALENT}>
          <ItemHealingDone amount={this.totalToLHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TrailOfLight;
