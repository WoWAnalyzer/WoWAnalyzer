import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer from 'parser/core/Analyzer';
import TalentStatisticBox, { STATISTIC_ORDER } from 'interface/others/TalentStatisticBox';
import ItemHealingDone from 'interface/ItemHealingDone';

// Example Log: /report/hRd3mpK1yTQ2tDJM/1-Mythic+MOTHER+-+Kill+(2:24)/14-丶寶寶小喵
class TrailOfLight extends Analyzer {
  totalToLProcs = 0;
  totalToLHealing = 0;
  totalToLOverhealing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.TRAIL_OF_LIGHT_TALENT.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.TRAIL_OF_LIGHT_HEAL.id) {
      this.totalToLProcs += 1;
      this.totalToLHealing += event.overheal || 0;
      this.totalToLOverhealing += (event.amount || 0);
    }
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.TRAIL_OF_LIGHT_TALENT.id}
        value={<ItemHealingDone amount={this.totalToLHealing} />}
        tooltip={`Trail of Light Procs: ${this.totalToLProcs}`}
        position={STATISTIC_ORDER.CORE(1)}
      />
    );
  }
}

export default TrailOfLight;
