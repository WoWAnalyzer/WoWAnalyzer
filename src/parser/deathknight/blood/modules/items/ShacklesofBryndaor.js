import React from 'react';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import RunicPowerTracker from 'parser/deathknight/blood/modules/runicpower/RunicPowerTracker';

class ShacklesofBryndaor extends Analyzer {

  static dependencies = {
    runicPowerTracker: RunicPowerTracker,
  };

  dsCost = 45;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasWrists(ITEMS.SHACKLES_OF_BRYNDAOR.id);
    if (this.selectedCombatant.hasTalent(SPELLS.OSSUARY_TALENT.id)) {
      this.dsCost -= 5;
    }
    if (this.selectedCombatant.hasBuff(SPELLS.BLOOD_DEATH_KNIGHT_T20_4SET_BONUS_BUFF.id)) {
      this.dsCost -= 5;
    }
  }

  get runicPowerGained(){
    return this.runicPowerTracker.getGeneratedBySpell(SPELLS.SHACKLES_OF_BRYNDAOR_BUFF.id);
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
        <>
          Refunded {Math.trunc(this.rpGainedPerMinute)} Runic Power per minute ({this.runicPowerGained} total).<br />
          {formatPercentage(rpPercent)} % of total Runic Power generated <br />
          This is a potential {Math.trunc(extraDS)} extra <SpellLink id={SPELLS.DEATH_STRIKE.id} /> casts.

        </>
      ),
    };
  }
}

export default ShacklesofBryndaor;
