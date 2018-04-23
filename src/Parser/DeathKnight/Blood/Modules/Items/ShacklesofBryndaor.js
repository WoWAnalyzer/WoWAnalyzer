import React from 'react';
import { formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import RunicPowerTracker from 'Parser/DeathKnight/Blood/Modules/RunicPower/RunicPowerTracker';

class ShacklesofBryndaor extends Analyzer {

  static dependencies = {
    combatants: Combatants,
    runicPowerTracker: RunicPowerTracker,
  };

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

  get runicPowerGained(){
    if(this.runicPowerTracker.buildersObj[SPELLS.SHACKLES_OF_BRYNDAOR_BUFF.id]){
      return this.runicPowerTracker.buildersObj[SPELLS.SHACKLES_OF_BRYNDAOR_BUFF.id].generated;
    }
    return 0;
  }

  get rpGainedPerMinute(){
    return this.runicPowerGained / this.owner.fightDuration * 1000 * 60;
  }

  item() {
    const rpPercent=this.runicPowerGained / this.runicPowerTracker.generated;
    const extraDS=this.runicPowerGained / this.dsCost;
    return {
      item: ITEMS.SHACKLES_OF_BRYNDAOR,
      result:(
        <React.Fragment>
          Refunded {Math.trunc(this.rpGainedPerMinute)} Runic Power per minute ({this.runicPowerGained} total).<br />
          {formatPercentage(rpPercent)} % of total Runic Power generated <br />
          This is a potential {Math.trunc(extraDS)} extra <SpellLink id={SPELLS.DEATH_STRIKE.id} /> casts.

        </React.Fragment>
      ),
    };
  }
}

export default ShacklesofBryndaor;
