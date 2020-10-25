import React from 'react';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import { formatNumber, formatPercentage } from 'common/format';
import UptimeIcon from 'interface/icons/Uptime';
import CriticalStrikeIcon from 'interface/icons/CriticalStrike';
import VersatilityIcon from 'interface/icons/Versatility';
import HasteIcon from 'interface/icons/Haste';
import MasteryIcon from 'interface/icons/Mastery';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import Events from 'parser/core/Events';

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
    SPELLS.ELEMENTAL_WHIRL_HASTE,
    SPELLS.ELEMENTAL_WHIRL_CRIT,
    SPELLS.ELEMENTAL_WHIRL_MASTERY,
    SPELLS.ELEMENTAL_WHIRL_VERSATILITY,
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
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(this.variousProcs), this.onApplyBuff);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(this.variousProcs), this.onRefreshBuff);
  }

  onApplyBuff(event) {
    this.handleBuff(event);
  }

  onRefreshBuff(event) {
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
    return this.variousProcs.reduce((a, b) => a + this.selectedCombatant.getBuffUptime(b.id), 0) / 4 / this.owner.fightDuration;
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
      <AzeritePowerStatistic size="flexible">
        <BoringSpellValueText
          spell={SPELLS.ELEMENTAL_WHIRL}
          tooltip={(
            <>
              {SPELLS.ELEMENTAL_WHIRL.name} grants <strong>{this.stat}</strong> of a secondary stat while active.<br />
              <ul>
                <li>
                  You procced {SPELLS.ELEMENTAL_WHIRL_HASTE.name} <strong>{this.hasteProcs} {(this.hasteProcs > 1 || this.hasteProcs === 0) ? 'times' : 'time'}</strong>.
                  ({formatPercentage(this.uptime(SPELLS.ELEMENTAL_WHIRL_HASTE.id))}% uptime)
                </li>
                <li>
                  You procced {SPELLS.ELEMENTAL_WHIRL_VERSATILITY.name} <strong>{this.versProcs} {(this.versProcs > 1 || this.versProcs === 0) ? 'times' : 'time'}</strong>.
                  ({formatPercentage(this.uptime(SPELLS.ELEMENTAL_WHIRL_VERSATILITY.id))}% uptime)
                </li>
                <li>You procced {SPELLS.ELEMENTAL_WHIRL_CRIT.name} <strong>{this.critProcs}  {(this.critProcs > 1 || this.critProcs === 0) ? 'times' : 'time'}</strong>.
                  ({formatPercentage(this.uptime(SPELLS.ELEMENTAL_WHIRL_CRIT.id))}% uptime)
                </li>
                <li>You procced {SPELLS.ELEMENTAL_WHIRL_MASTERY.name} <strong>{this.masteryProcs}  {(this.masteryProcs > 1 || this.masteryProcs === 0) ? 'times' : 'time'}</strong>.
                  ({formatPercentage(this.uptime(SPELLS.ELEMENTAL_WHIRL_MASTERY.id))}% uptime)
                </li>
              </ul>
            </>
          )}
        >
          <UptimeIcon /> {formatPercentage(this.averageUptime, 0)}% <small>uptime</small><br />
          <CriticalStrikeIcon /> {formatNumber(this.averageCrit)} <small>average Critical Strike gained</small><br />
          <HasteIcon /> {formatNumber(this.averageHaste)} <small>average Haste gained</small><br />
          <MasteryIcon /> {formatNumber(this.averageMast)} <small>average Mastery gained</small><br />
          <VersatilityIcon /> {formatNumber(this.averageVers)} <small>average Versatility gained</small>
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }
}

export default ElementalWhirl;

