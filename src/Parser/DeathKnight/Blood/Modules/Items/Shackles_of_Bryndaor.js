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
  }

  rpGained=0;
  rpPercent=0;

  on_toPlayer_energize(event) {
    if (event.ability.guid !== SPELLS.SHACKLES_OF_BRYNDAOR_BUFF.id) {
      return;
    }
    this.rpGained += (event.resourceChange || 0);
    console.log("RP:", this.rpGained);
  }


  item() {
    this.rpPercent=this.rpGained / this.runicPowerTracker.totalRPGained;
    return {
      item: ITEMS.SHACKLES_OF_BRYNDAOR,
      result:(
        <Wrapper>
          Runic Power Refunded : {this.rpGained}<br />
          {formatPercentage(this.rpPercent)} % <br />
          {this.runicPowerTracker.totalRPGained}

        </Wrapper>
      ),
    };
  }
}

export default ShacklesofBryndaor;
