import React from 'react';

import StatisticBox from 'Main/StatisticBox';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

const PHOTOSYNTHESIS_REJUV_INCREASE = 0.3;

class Photosynthesis extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  rejuvenationIncrease = 0;
  lifebloomIncrease = 0;

  lastRealBloomTimestamp = null;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.PHOTOSYNTHESIS_TALENT.id);
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.LIFEBLOOM_HOT_HEAL.id) {
      this.lastRealBloomTimestamp = event.timestamp;
    }
  }

  on_byPlayer_removebuff(event){
    const spellId = event.ability.guid;
    if(spellId !== SPELLS.LIFEBLOOM_HOT_HEAL.id) {
      return;
    }
    this.lastRealBloomTimestamp = event.timestamp;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const amount = event.amount + (event.absorbed || 0);

    if(spellId === SPELLS.REJUVENATION.id && this.combatants.selected.hasBuff(SPELLS.LIFEBLOOM_HOT_HEAL.id, null, 0, 0, this.combatants.selected.sourceID)) {
      this.rejuvenationIncrease += calculateEffectiveHealing(event, PHOTOSYNTHESIS_REJUV_INCREASE);
    }

    if(spellId === SPELLS.LIFEBLOOM_BLOOM_HEAL.id && (this.lastRealBloomTimestamp === null || (event.timestamp - this.lastRealBloomTimestamp) > 32)){
      this.lifebloomIncrease += amount;
    }
  }

  statistic() {
    const totalPercent = this.owner.getPercentageOfTotalHealingDone(this.rejuvenationIncrease + this.lifebloomIncrease);
    const sourceID = this.combatants.selected._combatantInfo.sourceID;
    const selfUptime = this.combatants.selected.getBuffUptime(SPELLS.LIFEBLOOM_HOT_HEAL.id, sourceID);
    const totalUptime =
      Object.keys(this.combatants.players)
          .map(key => this.combatants.players[key])
          .reduce((uptime, player) => uptime + player.getBuffUptime(SPELLS.LIFEBLOOM_HOT_HEAL.id),  sourceID);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.PHOTOSYNTHESIS_TALENT.id} />}
        value={`${formatPercentage(totalPercent)} %`}
        label={'Photosynthesis'}
        tooltip={`
            Healing contribution
            <ul>
              <li>Rejuvenation: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.rejuvenationIncrease))} %</b></li>
              <li>Lifebloom: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.lifebloomIncrease))} %</b></li>
            </ul>
            Lifebloom uptime
            <ul>
              <li>On Self: <b>${formatPercentage(selfUptime/ this.owner.fightDuration)} %</b>
              <li>On Others: <b>${formatPercentage((totalUptime - selfUptime) / this.owner.fightDuration)} %</b>
            </ul>
        `}
      />
    );
  }
}

export default Photosynthesis;
