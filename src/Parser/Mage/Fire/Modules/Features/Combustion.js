import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatNumber } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

class Combustion extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  lowPhoenixFlamesCharges = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.COMBUSTION.id) {
      return;
    }
    const phoenixFlamesCharges = this.spellUsable.chargesAvailable(SPELLS.PHOENIXS_FLAMES.id);
    if (phoenixFlamesCharges < 2) {
      this.lowPhoenixFlamesCharges += 1;
    }
  }

  get phoenixFlamesChargesSuggestionThresholds() {
    return {
      actual: this.lowPhoenixFlamesCharges,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 2,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.lowPhoenixFlamesCharges).isGreaterThan(this.phoenixFlamesChargesSuggestionThresholds.isGreaterThan.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>You cast <SpellLink id={SPELLS.COMBUSTION.id}/> {this.lowPhoenixFlamesCharges} times with less than 2 charges of <SpellLink id={SPELLS.PHOENIXS_FLAMES.id}/>. Make sure you are saving at least 2 charges while Combustion is on cooldown so you can get as many <SpellLink id={SPELLS.HOT_STREAK.id}/> procs as possible before Combustion ends.</Wrapper>)
          .icon(SPELLS.COMBUSTION.icon)
          .actual(`${formatNumber(this.lowPhoenixFlamesCharges)} Combustion Casts`)
          .recommended(`<${formatNumber(recommended)} is recommended`)
          .regular(this.phoenixFlamesChargesSuggestionThresholds.isGreaterThan.average).major(this.phoenixFlamesChargesSuggestionThresholds.isGreaterThan.major);
      });
  }
}
export default Combustion;
