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

  on_initialized() {
    this.active = this.combatants.selected.hasWrists(ITEMS.SHACKLES_OF_BRYNDAOR.id);
    if (this.combatants.selected.hasTalent(SPELLS.OSSUARY_TALENT.id)) {
      this.dsCost -= 5;
    }
    if (this.combatants.selected.hasBuff(SPELLS.BLOOD_DEATH_KNIGHT_T20_2SET_BONUS_BUFF.id)) {
      this.dsCost -= 5;
    }
  }

  rpGained=0;
  rpPercent=0;
  dsCost = 45;
  extraDS=0;

  on_toPlayer_energize(event) {
    if (event.ability.guid !== SPELLS.SHACKLES_OF_BRYNDAOR_BUFF.id) {
      return;
    }
    this.rpGained += (event.resourceChange || 0);
  }




  item() {
    this.rpPercent=this.rpGained / this.runicPowerTracker.totalRPGained;
    this.extraDS=this.rpGained /this.dsCost;
    return {
      item: ITEMS.SHACKLES_OF_BRYNDAOR,
      result:(
        <Wrapper>
          Runic Power Refunded : {this.rpGained}<br />
          {formatPercentage(this.rpPercent)} % of total RP <br />
          Extra Death Strikes possible: {Math.trunc(this.extraDS)}

        </Wrapper>
      ),
    };
  }
}

export default ShacklesofBryndaor;
