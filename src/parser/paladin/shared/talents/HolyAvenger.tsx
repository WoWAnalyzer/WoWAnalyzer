import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events, { EnergizeEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SpellIcon } from 'interface';
import React from 'react';
import BoringValueText from 'parser/ui/BoringValueText';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

class HolyAvenger extends Analyzer {

  wastedHolyPower: number = 0;
  gainedHolyPower: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.HOLY_AVENGER_TALENT.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.energize.by(SELECTED_PLAYER), this.getHolyPower);
  }

  getHolyPower(event: EnergizeEvent){
    if(!this.selectedCombatant.hasBuff(SPELLS.HOLY_AVENGER_TALENT.id)){
      return;
    }

    if(event.resourceChangeType !== RESOURCE_TYPES.HOLY_POWER.id) {
      return;
    }

    //holy avenger triples resource generate so we need to find base resource generation from the spell
    const baseAmount = event.resourceChange/3;
    const formHA = event.resourceChange - baseAmount;// this is also baseAmount * 2

    let waste = event.waste;
    const gain = event.resourceChange - waste;

    //We only care about what is from HA not the base spell
    if(waste > formHA){
      waste = formHA;
    }

    this.wastedHolyPower += waste;
    this.gainedHolyPower += Math.max(gain - baseAmount, 0);//Anything gained from HA is baseAmount + n where n >= 1
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringValueText label={<><SpellIcon id={SPELLS.HOLY_AVENGER_TALENT.id} /> Holy Avenger Holy Power</>}>
          {this.gainedHolyPower} Gained<br />
          {this.wastedHolyPower} Wasted
        </BoringValueText>
      </Statistic>
    );
  }
}

export default HolyAvenger;
