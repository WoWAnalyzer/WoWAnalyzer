import React from 'react';

import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import StatTracker from 'parser/shared/modules/StatTracker';
import Events from 'parser/core/Events';

const meticulousSchemingStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [haste] = calculateAzeriteEffects(SPELLS.METICULOUS_SCHEMING.id, rank);
  obj.haste += haste;
  return obj;
}, {
  haste: 0,
});

/**
 * Meticulous Scheming
 * Gain x haste for 20sec after casting 3 different spells within 8sec after gaining "Meticulous Scheming"
 *
 * Example report: https://www.warcraftlogs.com/reports/jBthQCZcWRNGyAk1#fight=29&type=auras&source=18
 */
class MeticulousScheming extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  haste = 0;
  meticulousSchemingProcs = 0;
  seizeTheMomentProcs = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.METICULOUS_SCHEMING.id);
    if (!this.active) {
      return;
    }

    const { haste } = meticulousSchemingStats(this.selectedCombatant.traitsBySpellId[SPELLS.METICULOUS_SCHEMING.id]);
    this.haste = haste;

    this.statTracker.add(SPELLS.SEIZE_THE_MOMENT.id, {
      haste,
    });
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell([SPELLS.METICULOUS_SCHEMING_BUFF, SPELLS.SEIZE_THE_MOMENT]), this.onApplyBuff);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell([SPELLS.METICULOUS_SCHEMING_BUFF, SPELLS.SEIZE_THE_MOMENT]), this.onRefreshBuff);
  }

  onApplyBuff(event) {
    this.handleBuff(event);
  }

  onRefreshBuff(event) {
    this.handleBuff(event);
  }

  handleBuff(event) {
    if (event.ability.guid === SPELLS.METICULOUS_SCHEMING_BUFF.id) {
      this.meticulousSchemingProcs += 1;
      return;
    }

    if (event.ability.guid === SPELLS.SEIZE_THE_MOMENT.id) {
      this.seizeTheMomentProcs += 1;
    }
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.SEIZE_THE_MOMENT.id) / this.owner.fightDuration;
  }

  get averageHaste() {
    return (this.haste * this.uptime).toFixed(0);
  }

  get suggestionThresholds() {
    return {
      actual: this.seizeTheMomentProcs / this.meticulousSchemingProcs,
      isLessThan: {
        minor: 1,
        average: 0.8,
        major: .6,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual) => suggest(<>You procced <SpellLink id={SPELLS.METICULOUS_SCHEMING.id} /> {this.meticulousSchemingProcs} times but got <SpellLink id={SPELLS.SEIZE_THE_MOMENT.id} /> only {this.seizeTheMomentProcs} times. That means you failed to cast 3 different spells within the 8sec window to trigger the haste buff. Pay more attention to the proc to get the most ouf of this trait.</>)
          .icon(SPELLS.METICULOUS_SCHEMING.icon)
          .actual(`${(formatPercentage(actual))}% ${SPELLS.METICULOUS_SCHEMING.name} efficiency`)
          .recommended(`100% is recommended`));
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.METICULOUS_SCHEMING.id}
        value={`${this.averageHaste} average Haste`}
        tooltip={(
          <>
          {SPELLS.METICULOUS_SCHEMING.name} grants <strong>{this.haste} haste</strong> while active.<br />
          You procced <strong>{SPELLS.METICULOUS_SCHEMING_BUFF.name} {this.meticulousSchemingProcs} times</strong> and activated <strong>{SPELLS.SEIZE_THE_MOMENT.name} {this.seizeTheMomentProcs} times</strong> with an uptime of {formatPercentage(this.uptime)}%.
          </>
        )}
      />
    );
  }
}

export default MeticulousScheming;
