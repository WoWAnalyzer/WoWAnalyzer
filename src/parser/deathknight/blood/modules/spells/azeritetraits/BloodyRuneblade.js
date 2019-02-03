import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import StatTracker from 'parser/shared/modules/StatTracker';
import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';


const bloodyRunebladeStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [haste] = calculateAzeriteEffects(SPELLS.BLOODY_RUNEBLADE.id, rank);
  obj.haste += haste;
  return obj;
}, {
  haste: 0,
});

/**
 * Bloody Runeblade
 * When Crimson Scourge activates, you gain 0 Haste for 5 sec, and immediately gain 5 Runic Power.
 *
 * Example Report: https://www.warcraftlogs.com/reports/cC8kzR9YxnB3GMhr/#fight=12&source=14
 */
class BloddyRuneblade extends Analyzer{

  static dependencies = {
    statTracker: StatTracker,
  };

  haste = 0;
  bloodyRunebladeProcsCounter = 0;
  bloodyRunebladeRPGain = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.BLOODY_RUNEBLADE.id);
    if (!this.active) {
      return;
    }

    const { haste } = bloodyRunebladeStats(this.selectedCombatant.traitsBySpellId[SPELLS.BLOODY_RUNEBLADE.id]);
    this.haste = haste;

    this.statTracker.add(SPELLS.BLOODY_RUNEBLADE_BUFF.id, {
      haste,
    });
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BLOODY_RUNEBLADE_BUFF), this.onBuffEvent);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.BLOODY_RUNEBLADE_RP_GAIN), this.onEnergizeEvent);
  }

  onBuffEvent(event) {
    this.bloodyRunebladeProcsCounter += 1;
  }

  onEnergizeEvent(event) {
    this.bloodyRunebladeRPGain += event.resourceChange;
  }

  get averageHaste() {
    return this.selectedCombatant.getBuffUptime(SPELLS.BLOODY_RUNEBLADE_BUFF.id) / this.owner.fightDuration * this.haste;
  }

  statistic(){
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.BLOODY_RUNEBLADE.id}
        value={(
          <>
            {this.bloodyRunebladeRPGain} RP Gained<br />
            {formatNumber(this.averageHaste)} average Haste
          </>
        )}
        tooltip={`
          ${this.bloodyRunebladeProcsCounter} Procs
        `}
      />
    );
  }
}

export default BloddyRuneblade;
