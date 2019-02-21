import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import StatTracker from 'parser/shared/modules/StatTracker';
import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';


const furiousGazeStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [haste] = calculateAzeriteEffects(SPELLS.FURIOUS_GAZE.id, rank);
  obj.haste += haste;
  return obj;
}, {
  haste: 0,
});

/**
 * Furious Gaze
 * When Eye Beam finishes fully channeling, your Haste is increased by 887 for 12 sec.
 *
 * Example Report: https://www.warcraftlogs.com/reports/3DFqkLhgRMB9wHQ7/#fight=33&source=16
 */
class FuriousGaze extends Analyzer{

  static dependencies = {
    statTracker: StatTracker,
  };

  haste = 0;
  furiousGazeProcsCounter = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.FURIOUS_GAZE.id);
    if (!this.active) {
      return;
    }

    const { haste } = furiousGazeStats(this.selectedCombatant.traitsBySpellId[SPELLS.FURIOUS_GAZE.id]);
    this.haste = haste;

    this.statTracker.add(SPELLS.FURIOUS_GAZE.id, {
      haste,
    });
    console.log("haste amount? ", haste);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FURIOUS_GAZE_BUFF), this.onBuffEvent);
  }

  onBuffEvent(event) {
    this.furiousGazeProcsCounter += 1;
  }

  get averageHaste() {
    return this.selectedCombatant.getBuffUptime(SPELLS.FURIOUS_GAZE_BUFF.id) / this.owner.fightDuration * this.haste;
  }

  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.FURIOUS_GAZE_BUFF.id) / this.owner.fightDuration;
  }

  statistic(){
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.FURIOUS_GAZE.id}
        value={(
          <>
            {formatNumber(this.averageHaste)} average Haste
          </>
        )}
        tooltip={`
          ${formatPercentage(this.buffUptime)}% uptime<br />
          ${this.furiousGazeProcsCounter} Procs
        `}
      />
    );
  }
}

export default FuriousGaze;
