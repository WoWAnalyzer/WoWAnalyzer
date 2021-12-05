import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import EventHistory from 'parser/shared/modules/EventHistory';
import FilteredActiveTime from 'parser/shared/modules/FilteredActiveTime';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import { MS_BUFFER_100, MS_BUFFER_250 } from '@wowanalyzer/mage';

const debug = false;

class SunKingsBlessing extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
    filteredActiveTime: FilteredActiveTime,
  };
  protected eventHistory!: EventHistory;
  protected filteredActiveTime!: FilteredActiveTime;

  expiredBuffs = 0;
  sunKingApplied = 0;
  sunKingTotalDelay = 0;
  totalSunKingBuffs = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.SUN_KINGS_BLESSING.bonusID);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SUN_KINGS_BLESSING_BUFF_STACK),
      this.onStackRemoved,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SUN_KINGS_BLESSING_BUFF),
      this.onSunKingApplied,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.COMBUSTION),
      this.onCombustionStart,
    );
  }

  onStackRemoved(event: RemoveBuffEvent) {
    const lastCast = this.eventHistory.last(
      1,
      MS_BUFFER_100,
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.PYROBLAST, SPELLS.FLAMESTRIKE]),
    );
    if (lastCast.length === 0) {
      debug && this.log('Sun King Blessing Stack expired');
      this.expiredBuffs += 1;
    }
  }

  onSunKingApplied(event: ApplyBuffEvent) {
    this.sunKingApplied = event.timestamp;
    this.totalSunKingBuffs += 1;
  }

  onCombustionStart(event: ApplyBuffEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.SUN_KINGS_BLESSING_BUFF.id)) {
      const lastPyroBegin = this.eventHistory.last(
        1,
        5000,
        Events.begincast.by(SELECTED_PLAYER).spell(SPELLS.PYROBLAST),
      );
      const lastPyroCast = this.eventHistory.last(
        1,
        MS_BUFFER_250,
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PYROBLAST),
      );
      if (
        lastPyroCast.length === 0 ||
        lastPyroBegin.length === 0 ||
        lastPyroCast[0].timestamp - lastPyroBegin[0].timestamp < MS_BUFFER_250
      ) {
        return;
      }
      this.sunKingTotalDelay += lastPyroBegin[0].timestamp - this.sunKingApplied;
    }
  }

  get averageSunKingDelaySeconds() {
    return this.sunKingTotalDelay / this.totalSunKingBuffs / 1000;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(30)}
        size="flexible"
        tooltip={
          <>
            This shows the average time that the Sun King's Blessing buff was available before the
            player activated it by hardcasting Pyroblast. This only includes the time from when the
            buff became available (after the 8th Hot Streak) until the hardcast Pyroblast was
            started, it does not include the amount of time that it took to hardcast Pyroblast.
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.SUN_KINGS_BLESSING_BUFF.id}>
          {this.averageSunKingDelaySeconds.toFixed(2)}s{' '}
          <small>Avg. Sun King Activation Delay</small>
          <br />
          {this.expiredBuffs} <small>Expired Sun King buffs</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SunKingsBlessing;
