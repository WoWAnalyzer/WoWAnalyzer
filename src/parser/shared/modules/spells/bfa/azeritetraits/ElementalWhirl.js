import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import { formatNumber, formatPercentage } from 'common/format';
import StatTracker from 'parser/shared/modules/StatTracker';

const elementalWhirlStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [stat] = calculateAzeriteEffects(SPELLS.ELEMENTAL_WHIRL.id, rank);
  obj.stat += stat;
  return obj;
}, {
  stat: 0,
});

/**
 * Elemental Whirl
 * Your damaging abilities have a chance to grant you Elemental Whirl, increasing your Critical Strike, Haste, Mastery, or Versatility by X for 10 sec.
 *
 * Example report: https://www.warcraftlogs.com/reports/Xr7Nxjd1KnMT9QBf/#fight=1&source=13&type=auras
 */
class ElementalWhirl extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  stat = 0;
  hasteProcs = 0;
  critProcs = 0;
  masteryProcs = 0;
  versProcs = 0;

  variousProcs = [
    SPELLS.ELEMENTAL_WHIRL_HASTE.id,
    SPELLS.ELEMENTAL_WHIRL_CRIT.id,
    SPELLS.ELEMENTAL_WHIRL_MASTERY.id,
    SPELLS.ELEMENTAL_WHIRL_VERSATILITY.id,
  ];

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.ELEMENTAL_WHIRL.id);
    if (!this.active) {
      return;
    }
    const { stat } = elementalWhirlStats(this.selectedCombatant.traitsBySpellId[SPELLS.ELEMENTAL_WHIRL.id]);
    this.stat = stat;

    this.statTracker.add(SPELLS.ELEMENTAL_WHIRL_CRIT.id, {
      crit: stat,
    });
    this.statTracker.add(SPELLS.ELEMENTAL_WHIRL_HASTE.id, {
      haste: stat,
    });
    this.statTracker.add(SPELLS.ELEMENTAL_WHIRL_MASTERY.id, {
      mastery: stat,
    });
    this.statTracker.add(SPELLS.ELEMENTAL_WHIRL_VERSATILITY.id, {
      versatility: stat,
    });
  }

  on_byPlayer_applybuff(event) {
    this.handleBuff(event);
  }

  on_byPlayer_refreshbuff(event) {
    this.handleBuff(event);
  }

  handleBuff(event) {
    if (event.ability.guid === SPELLS.ELEMENTAL_WHIRL_CRIT.id) {
      this.critProcs += 1;
      return;
    }
    if (event.ability.guid === SPELLS.ELEMENTAL_WHIRL_HASTE.id) {
      this.hasteProcs += 1;
      return;
    }
    if (event.ability.guid === SPELLS.ELEMENTAL_WHIRL_MASTERY.id) {
      this.masteryProcs += 1;
      return;
    }
    if (event.ability.guid === SPELLS.ELEMENTAL_WHIRL_VERSATILITY.id) {
      this.versProcs += 1;
    }
  }

  uptime(spellId) {
    return this.selectedCombatant.getBuffUptime(spellId) / this.owner.fightDuration;
  }

  get averageUptime() {
    return this.variousProcs.reduce((a, b) => a + this.selectedCombatant.getBuffUptime(b), 0) / 4 / this.owner.fightDuration;
  }

  get averageHaste() {
    return (this.stat * this.uptime(SPELLS.ELEMENTAL_WHIRL_HASTE.id)).toFixed(0);
  }
  get averageCrit() {
    return (this.stat * this.uptime(SPELLS.ELEMENTAL_WHIRL_CRIT.id)).toFixed(0);
  }
  get averageMast() {
    return (this.stat * this.uptime(SPELLS.ELEMENTAL_WHIRL_MASTERY.id)).toFixed(0);
  }
  get averageVers() {
    return (this.stat * this.uptime(SPELLS.ELEMENTAL_WHIRL_VERSATILITY.id)).toFixed(0);
  }

  statistic() {

    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.ELEMENTAL_WHIRL.id}
        value={(
          <>
            {formatPercentage(this.averageUptime)}% average uptime <br />
            {formatNumber(this.averageHaste)} average Haste <br />
            {formatNumber(this.averageVers)} average Versatility <br />
            {formatNumber(this.averageCrit)} average Crit <br />
            {formatNumber(this.averageMast)} average Mastery
          </>)}
        tooltip={`
          ${SPELLS.ELEMENTAL_WHIRL.name} grants <b>${this.stat}</b> of a secondary stat while active.<br/>
          <ul>
            <li>You procced ${SPELLS.ELEMENTAL_WHIRL_HASTE.name} <b>${this.hasteProcs} ${(this.hasteProcs > 1 || this.hasteProcs === 0) ? 'times' : 'time'}</b>.</li>
                <ul><li>Uptime: ${formatPercentage(this.uptime(SPELLS.ELEMENTAL_WHIRL_HASTE.id))}%</li></ul>
            <li>You procced ${SPELLS.ELEMENTAL_WHIRL_VERSATILITY.name} <b>${this.versProcs}  ${(this.versProcs > 1 || this.versProcs === 0) ? 'times' : 'time'}</b>.</li>
                <ul><li>Uptime: ${formatPercentage(this.uptime(SPELLS.ELEMENTAL_WHIRL_VERSATILITY.id))}%</li></ul>
            <li>You procced ${SPELLS.ELEMENTAL_WHIRL_CRIT.name} <b>${this.critProcs}  ${(this.critProcs > 1 || this.critProcs === 0) ? 'times' : 'time'}</b>.</li>
                <ul><li>Uptime: ${formatPercentage(this.uptime(SPELLS.ELEMENTAL_WHIRL_CRIT.id))}%</li></ul>
            <li>You procced ${SPELLS.ELEMENTAL_WHIRL_MASTERY.name} <b>${this.masteryProcs}  ${(this.masteryProcs > 1 || this.masteryProcs === 0) ? 'times' : 'time'}</b>.</li>
                <ul><li>Uptime: ${formatPercentage(this.uptime(SPELLS.ELEMENTAL_WHIRL_MASTERY.id))}%</li></ul>
          </ul>
        `}
      />
    );
  }
}

export default ElementalWhirl;

