import React from 'react';
import { formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS';
import Wrapper from 'common/Wrapper';
import RunicPowerTracker from 'Parser/DeathKnight/Blood/Modules/RunicPower/RunicPowerTracker';


class ShacklesofBryndaor extends Analyzer {

  static dependencies = {
    combatants: Combatants,
    runicPowerTracker: RunicPowerTracker,
  };

  rpGained=0;
  dsCost = 45;

  on_initialized() {
    this.active = this.combatants.selected.hasWrists(ITEMS.SHACKLES_OF_BRYNDAOR.id);
    if (this.combatants.selected.hasTalent(SPELLS.OSSUARY_TALENT.id)) {
      this.dsCost -= 5;
    }
    if (this.combatants.selected.hasBuff(SPELLS.BLOOD_DEATH_KNIGHT_T20_4SET_BONUS_BUFF.id)) {
      this.dsCost -= 5;
    }
  }

  get rpGainedPerMinute(){
    return this.rpGained / this.owner.fightDuration * 1000 * 60;
  }

  on_toPlayer_energize(event) {
    if (event.ability.guid !== SPELLS.SHACKLES_OF_BRYNDAOR_BUFF.id) {
      return;
    }
    this.rpGained += (event.resourceChange || 0);
  }


  item() {
    const rpPercent=this.rpGained / this.runicPowerTracker.totalRPGained;
    const extraDS=this.rpGained /this.dsCost;
    return {
      item: ITEMS.SHACKLES_OF_BRYNDAOR,
      result:(
        <Wrapper>
          Runic Power Refunded : {Math.trunc(this.rpGainedPerMinute)} per min. {this.rpGained} total.<br />
          {formatPercentage(rpPercent)} % of total RP <br />
          Extra Death Strikes possible: {Math.trunc(extraDS)}

        </Wrapper>
      ),
    };
  }
}

export default ShacklesofBryndaor;
