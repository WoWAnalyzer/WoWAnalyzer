import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber, formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';

const primalInstinctsStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [mastery] = calculateAzeriteEffects(SPELLS.PRIMAL_INSTINCTS.id, rank);
  obj.mastery += mastery;
  return obj;
}, {
  mastery: 0,
});

export const STAT_TRACKER = {
  mastery: combatant => primalInstinctsStats(combatant.traitsBySpellId[SPELLS.PRIMAL_INSTINCTS.id]).mastery,
};

/**
 * Aspect of the Wild increases your Mastery by X, and grants you a charge of Barbed Shot.
 *
 * Example report: https://www.warcraftlogs.com/reports/QdrGMj1wFqnacXNW#fight=1&type=auras&source=13
 */
class PrimalInstincts extends Analyzer {
  mastery = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.PRIMAL_INSTINCTS.id);
    if (!this.active) {
      return;
    }
    const { mastery } = primalInstinctsStats(this.selectedCombatant.traitsBySpellId[SPELLS.PRIMAL_INSTINCTS.id]);
    this.mastery = mastery;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.PRIMAL_INSTINCTS_BUFF.id) / this.owner.fightDuration;
  }

  get avgMastery() {
    return this.uptime * this.mastery;
  }

  get numProcs() {
    return this.selectedCombatant.getBuffTriggerCount(SPELLS.PRIMAL_INSTINCTS_BUFF.id);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.PRIMAL_INSTINCTS.id}
        value={(
          <>
            {formatNumber(this.avgMastery)} Average Mastery <br />
            Up to {this.numProcs} <SpellLink id={SPELLS.BARBED_SHOT.id} /> charges regained
          </>
        )}
        tooltip={`Primal Instincts granted <b>${this.mastery}</b> mastery for <b>${formatPercentage(this.uptime)}%</b> of the fight.`}
      />
    );
  }
}

export default PrimalInstincts;
