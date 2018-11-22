import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS/index';
import { formatNumber } from 'common/format';
import TalentStatisticBox, { STATISTIC_ORDER } from 'interface/others/TalentStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';

const SPIRIT_DAMAGE_MULTIPLIER = 2;
const SPIRIT_INSANITY_GENERATION = 2;

// Example log: /report/K3VAhbp9CtLwG81j/26-Heroic+Zul+-+Kill+(4:44)/6-Isentropy
class AuspiciousSpirits extends Analyzer {
  damage = 0;
  insanity = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.AUSPICIOUS_SPIRITS_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.SHADOWY_APPARITION_DAMAGE.id) {
      return;
    }

    this.damage += event.amount + (event.absorbed || 0);
    this.insanity += SPIRIT_INSANITY_GENERATION;
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.AUSPICIOUS_SPIRITS_TALENT.id}
        value={<ItemDamageDone amount={this.damage / SPIRIT_DAMAGE_MULTIPLIER} />}
        tooltip={`
        ${formatNumber(this.insanity)} Insanity generated.<br /><br />
        The damage displayed is the additional damage you gained from taking this talent. The Spirits are doing roughly twice as much overall damage.
        `}
        position={STATISTIC_ORDER.CORE(5)}
      />
    );
  }
}

export default AuspiciousSpirits;
