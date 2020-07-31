import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import UptimeIcon from 'interface/icons/Uptime';
import HasteIcon from 'interface/icons/Haste';
import Statistic from 'interface/statistics/Statistic';
import { calculateAzeriteEffects } from 'common/stats';
import StatTracker from 'parser/shared/modules/StatTracker';
import { formatPercentage, formatNumber } from 'common/format';
import Events, { ApplyBuffEvent, EventType, RefreshBuffEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

const inTheRhythmStats = (traits: number[]) => Object.values(traits).reduce((obj, rank) => {
  const [haste] = calculateAzeriteEffects(SPELLS.IN_THE_RHYTHM.id, rank);
  obj.haste += haste;
  return obj;
}, {
  haste: 0,
});

const DURATION = 8000;

/** Rapid Fire
 * When Rapid Fire finishes fully channeling, your Haste is increased by 623 for 8 sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/9Ljy6fh1TtCDHXVB#fight=2&type=auras&source=25&ability=272733
 */

class InTheRhythm extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  protected statTracker!: StatTracker;

  applications = 0;
  lastApplicationTimestamp = 0;
  possibleApplications = 0;
  haste = 0;
  wastedUptime = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTrait(SPELLS.IN_THE_RHYTHM.id);
    if (!this.active) {
      return;
    }
    const { haste } = inTheRhythmStats(this.selectedCombatant.traitsBySpellId[SPELLS.IN_THE_RHYTHM.id]);
    this.haste = haste;

    options.statTracker.add(SPELLS.IN_THE_RHYTHM_BUFF.id, {
      haste: this.haste,
    });
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.IN_THE_RHYTHM_BUFF), (event: ApplyBuffEvent) => this.itrApplication(event));
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.IN_THE_RHYTHM_BUFF), (event: RefreshBuffEvent) => this.itrApplication(event));
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.RAPID_FIRE), this.possibleApplication);
  }

  possibleApplication() {
    this.possibleApplications += 1;
  }

  itrApplication(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.applications += 1;
    if(event.type === EventType.RefreshBuff) {
      this.wastedUptime += DURATION - (event.timestamp - this.lastApplicationTimestamp);
    }
    this.lastApplicationTimestamp = event.timestamp;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.IN_THE_RHYTHM_BUFF.id) / this.owner.fightDuration;
  }

  get avgHaste() {
    return this.uptime * this.haste;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        tooltip={(
          <>
            In The Rhythm granted <strong>{this.haste}</strong> Haste for <strong>{formatPercentage(this.uptime)}%</strong> of the fight.<br />
            You lost out on {formatNumber(this.wastedUptime / 1000)} seconds of uptime from refreshing the buff before it expired.
          </>
        )}
        category={STATISTIC_CATEGORY.AZERITE_POWERS}
      >
        <BoringSpellValueText spell={SPELLS.IN_THE_RHYTHM}>
          <>
            {this.applications}/{this.possibleApplications} <small>applications</small><br />
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small><br />
            <HasteIcon /> {formatNumber(this.avgHaste)} <small>average Haste gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default InTheRhythm;
