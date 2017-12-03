import React from 'react';
import { formatThousands, formatPercentage, formatNumber } from 'common/format';

import CoreGarothiFeedbackConduit from 'Parser/Core/Modules/Items/GarothiFeedbackConduit';
import STAT from "Parser/Core/Modules/Features/STAT";
import StatTracker from "Parser/Core/Modules/StatTracker";
import HealingDone from 'Parser/Core/Modules/HealingDone';
import ITEMS from 'common/ITEMS';
import SPELLS from "common/SPELLS";
import StatWeights from '../Features/StatWeights';

class GarothiFeedbackConduit extends CoreGarothiFeedbackConduit {
  static dependencies = {
    ...CoreGarothiFeedbackConduit.dependencies,
    statWeights: StatWeights,
    statTracker: StatTracker,
    healingDone: HealingDone,
  };

  totalIntellect = 0;

  on_initialized() {
    super.on_initialized();
    this.totalIntellect = this.statTracker.startingIntellectRating;
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if(!event.prepull) {
      return;
    }
    if(spellId === SPELLS.POTION_OF_PROLONGED_POWER.id) {
      this.totalIntellect -= 2500;
    }
    if(spellId === SPELLS.DEFILED_AUGMENT_RUNE.id) {
      this.totalIntellect -= 325;
    }
    if(spellId === SPELLS.FLASK_OF_THE_WHISPERED_PACT.id) {
      this.totalIntellect -= 1300;
    }
  }

  item() {
    const avgHaste =
      this.totalProccValue.reduce((acc, proc) => acc + (proc[0] * proc[1]), 0) / this.owner.fightDuration;
    const hpmWeight = this.statWeights._getGain(STAT.HASTE_HPM) / (this.statWeights.totalOneInt || 1);
    const throughput = (hpmWeight * avgHaste) / this.totalIntellect;

    //TODO: Add the healing from each haste rating in the future:
    const healing = this.statWeights._getGain(STAT.HASTE_HPM) * avgHaste;

    return {
      item: ITEMS.GAROTHI_FEEDBACK_CONDUIT,
      result: (
        <dfn
          data-tip={`The throughput shown is calculated by using the int on "Stats on pull" and the stat weights of HPM.</b>`}
        >
          {formatThousands(avgHaste)} average haste rating gained.<br />
          {formatPercentage(throughput)} % / {formatNumber(healing / this.owner.fightDuration * 1000)} HPS <br />
        </dfn>
      ),
    };
  }
}

export default GarothiFeedbackConduit;
