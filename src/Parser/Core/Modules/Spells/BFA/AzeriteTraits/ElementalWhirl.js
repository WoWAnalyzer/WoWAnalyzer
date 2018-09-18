import React from 'react';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer from 'Parser/Core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import { formatNumber, formatPercentage } from 'common/format';

const elementalWhirlStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [stat] = calculateAzeriteEffects(SPELLS.ELEMENTAL_WHIRL.id, rank);
  obj.stat += stat;
  return obj;
}, {
  stat: 0,
});

export const STAT_TRACKER_HASTE = {
  haste: combatant => elementalWhirlStats(combatant.traitsBySpellId[SPELLS.ELEMENTAL_WHIRL.id]).haste,
};
export const STAT_TRACKER_CRIT = {
  crit: combatant => elementalWhirlStats(combatant.traitsBySpellId[SPELLS.ELEMENTAL_WHIRL.id]).crit,
};
export const STAT_TRACKER_VERS = {
  versatility: combatant => elementalWhirlStats(combatant.traitsBySpellId[SPELLS.ELEMENTAL_WHIRL.id]).versatility,
};
export const STAT_TRACKER_MAST = {
  mastery: combatant => elementalWhirlStats(combatant.traitsBySpellId[SPELLS.ELEMENTAL_WHIRL.id]).mastery,
};

/**
 * Meticulous Scheming
 * Your damaging abilities have a chance to grant you Elemental Whirl, increasing your Critical Strike, Haste, Mastery, or Versatility by X for 10 sec.
 *
 * Example report: https://www.warcraftlogs.com/reports/Xr7Nxjd1KnMT9QBf/#fight=1&source=13&type=auras
 */
class ElementalWhirl extends Analyzer {
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
          <React.Fragment>
            {formatPercentage(this.averageUptime)}% average uptime <br />
            {formatNumber(this.averageHaste)} average Haste <br />
            {formatNumber(this.averageVers)} average Versatility <br />
            {formatNumber(this.averageCrit)} average Crit <br />
            {formatNumber(this.averageMast)} average Mastery
          </React.Fragment>)}
        tooltip={`
          ${SPELLS.ELEMENTAL_WHIRL.name} grants <b>${this.stat}</b> of a secondary stat while active.<br/>
          <ul>
            <li>You procced ${SPELLS.ELEMENTAL_WHIRL_VERSATILITY.name} <b>${this.versProcs} times</b>.</li>
                <ul><li>Uptime: ${formatPercentage(this.uptime(SPELLS.ELEMENTAL_WHIRL_VERSATILITY.id))}%</li></ul>
            <li>You procced ${SPELLS.ELEMENTAL_WHIRL_MASTERY.name} <b>${this.masteryProcs} times</b>.</li>
                <ul><li>Uptime: ${formatPercentage(this.uptime(SPELLS.ELEMENTAL_WHIRL_MASTERY.id))}%</li></ul>
            <li>You procced ${SPELLS.ELEMENTAL_WHIRL_CRIT.name} <b>${this.critProcs} times</b>.</li>
                <ul><li>Uptime: ${formatPercentage(this.uptime(SPELLS.ELEMENTAL_WHIRL_CRIT.id))}%</li></ul>
            <li>You procced ${SPELLS.ELEMENTAL_WHIRL_HASTE.name} <b>${this.hasteProcs} times</b>.</li>
                <ul><li>Uptime: ${formatPercentage(this.uptime(SPELLS.ELEMENTAL_WHIRL_HASTE.id))}%</li></ul>
          </ul>
        `}
      />
    );
  }
}

export default ElementalWhirl;
