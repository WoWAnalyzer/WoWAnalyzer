import React from 'react';

import StatisticBox from 'interface/others/StatisticBox';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import { formatPercentage } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import HotTracker from 'parser/druid/restoration/modules/core/hottracking/HotTracker';
import Combatants from 'parser/shared/modules/Combatants';
import Events from 'parser/core/Events';

const STONEBARK_HOT_INCREASE = 0.2;
const BUFFER_MS = 200;

class Stonebark extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    hotTracker: HotTracker,
  };

  healing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STONEBARK_TALENT.id);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }


  onHeal(event) {
    const spellId = event.ability.guid;

    const combatant = this.combatants.players[event.targetID];
    if (!combatant) {
      // If combatant doesn't exist it's probably a pet.
      return;
    }
    const hasBuff = combatant.hasBuff(SPELLS.IRONBARK.id, event.timestamp, BUFFER_MS);
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
        label="Stonebark"
        tooltip="This only calculates the increased HoT healing from Stonebark and does not account for the reduced CD. Add 25% of the result from the Ironbark module to get an estimate on what this talent actually did."
      />
    );
  }
}

export default Stonebark;
