import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import { formatNumber, formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';

const danceOfDeathStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [mastery] = calculateAzeriteEffects(SPELLS.PRIMAL_INSTINCTS.id, rank);
  obj.mastery += mastery;
  return obj;
}, {
  mastery: 0,
});

export const STAT_TRACKER = {
  mastery: combatant => danceOfDeathStats(combatant.traitsBySpellId[SPELLS.PRIMAL_INSTINCTS.id]).mastery,
};

/**
 * Aspect of the Wild increases your Mastery by X, and grants you a charge of Barbed Shot.
 *
 * Example report: https://www.warcraftlogs.com/reports/Nt9KGvDncPmVyjpd#boss=-2&difficulty=0&type=summary&source=9
 */
class PrimalInstincts extends Analyzer {
  mastery = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.PRIMAL_INSTINCTS.id);
    if (!this.active) {
      return;
    }
    const { mastery } = danceOfDeathStats(this.selectedCombatant.traitsBySpellId[SPELLS.PRIMAL_INSTINCTS.id]);
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
          <React.Fragment>
            {formatNumber(this.avgMastery)} Average Mastery <br />
            {formatPercentage(this.uptime)}% Uptime <br />
            Up to {this.numProcs} <SpellLink id={SPELLS.BARBED_SHOT.id} /> charges regained
          </React.Fragment>
        )}
        tooltip={`Primal Instincts granted <b>${this.mastery}</b> mastery for <b>${formatPercentage(this.uptime)}%</b> of the fight.`}
      />
    );
  }
}

export default PrimalInstincts;
