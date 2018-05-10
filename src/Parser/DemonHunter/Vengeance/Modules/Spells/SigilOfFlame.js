import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';

import { formatPercentage, formatThousands, formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class SigilOfFlame extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    enemies: Enemies,
  };

  previousBuff = 0;
  currentBuff = 0;
  difference = 0;
  stacked = 0;

  on_byPlayer_applydebuff(event){
    const spellId = event.ability.guid;

    if(spellId !== SPELLS.SIGIL_OF_FLAME_DEBUFF.id) {
      return;
    } else{
      if(this.previousBuff === 0){
        this.previousBuff = event.timestamp;
        return;
      }else{
        this.currentBuff = event.timestamp;
        this.difference = this.currentBuff - this.previousBuff;
      }
      if((this.difference/1000) < 2 ) {
        this.stacked += 1;
      }
      this.previousBuff = this.currentBuff;

      console.log("stacked #", this.stacked);
      }
    }


  statistic() {
    const sigilOfFlameUptime = this.enemies.getBuffUptime(SPELLS.SIGIL_OF_FLAME_DEBUFF.id);
    const sigilOfFlameUptimePercentage = sigilOfFlameUptime / this.owner.fightDuration;
    const sigilOfFlameDamage = this.abilityTracker.getAbility(SPELLS.SIGIL_OF_FLAME_DEBUFF.id).damageEffective;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SIGIL_OF_FLAME.id} />}
        value={`${this.stacked} Times`}
        label="Sigil of Flame Double Stacked"
        tooltip={`Sigil of Flame uptime: ${formatPercentage(sigilOfFlameUptimePercentage)}% <br/>
                  Sigil of Flame total damage: ${formatThousands(sigilOfFlameDamage)}.<br/>
                  Sigil of Flame duration: ${formatDuration(sigilOfFlameUptime / 1000)}.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(9);
}

export default SigilOfFlame;
