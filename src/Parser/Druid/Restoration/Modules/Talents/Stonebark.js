import React from 'react';

import StatisticBox from 'Interface/Others/StatisticBox';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import HotTracker from 'Parser/Druid/Restoration/Modules/Core/HotTracking/HotTracker';
import Combatants from 'Parser/Core/Modules/Combatants';

const STONEBARK_HOT_INCREASE = 0.2;

class Stonebark extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    hotTracker: HotTracker,
  };

  healing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STONEBARK_TALENT.id);
  }


  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    const combatant = this.combatants.players[event.targetID];
    if (!combatant) {
      // If combatant doesn't exist it's probably a pet.
      return;
    }
    const hasBuff = combatant.hasBuff(SPELLS.IRONBARK.id, event.timestamp, 250);
    if (!hasBuff) {
      return;
    }

    if(this.hotTracker.hotInfo[spellId] != null) {
      this.healing += calculateEffectiveHealing(event, STONEBARK_HOT_INCREASE);
    }
  }

  statistic() {
    const throughputPercent = this.owner.getPercentageOfTotalHealingDone(this.healing);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.STONEBARK_TALENT.id} />}
        value={`${formatPercentage(throughputPercent)} %`}
        label={'Ironbark'}
        tooltip={`This only calculates the increased HoT healing from Stonebark and does not account for the reduced CD.
        Add 25% of the result from the Ironbark module to get an estimate on what this talent actually did.`}
      />
    );
  }
}

export default Stonebark;
