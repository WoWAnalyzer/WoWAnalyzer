import React from 'react';
import SPELLS from 'common/SPELLS/index';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';

import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

const HOT_HAND_DAMAGE_MODIFIER = 1.0;

class HotHand extends Analyzer {

  damageGained=0;
  maelstromSaved=0;
  procUses=0;
  procCount=0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.HOT_HAND_TALENT.id);
  }

  on_byPlayer_applybuff(event) {
    if (event.ability.guid!==SPELLS.HOT_HAND_BUFF.id){
      return;
    }

    this.procCount++;
  }

  on_byPlayer_refreshbuff(event) {
    if (event.ability.guid!==SPELLS.HOT_HAND_BUFF.id){
      return;
    }

    this.procCount++;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid!==SPELLS.LAVA_LASH.id){
      return;
    }

    if(!this.selectedCombatant.hasBuff(SPELLS.HOT_HAND_BUFF.id)) {
      return;
    }

    this.procUses++;
    this.damageGained += calculateEffectiveDamage(event, HOT_HAND_DAMAGE_MODIFIER);
    this.maelstromSaved += SPELLS.LAVA_LASH.maelstrom;
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damageGained);
  }

  get damagePerSecond() {
    return this.damageGained / (this.owner.fightDuration / 1000);
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.HOT_HAND_TALENT.id}
        value={`${formatPercentage(this.damagePercent)} %`}
        label="Hot Hand Damage"
        tooltip={<>
          Contributed {formatNumber(this.damagePerSecond)} DPS ({formatNumber(this.damageGained)} total damage).<br />
          You've used <strong>{this.procUses}</strong> out of <strong>{this.procCount}</strong> total procs.
        </>}
      />
    );
  }
}

export default HotHand;
