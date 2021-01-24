import React from 'react';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { formatPercentage } from 'common/format';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import EventHistory from 'parser/shared/modules/EventHistory';
import { MS_BUFFER_250 } from '@wowanalyzer/mage';
import { Trans } from '@lingui/macro';

import HotStreakPreCasts from './HotStreakPreCasts';


const debug = false;

class HotStreak extends Analyzer {
  static dependencies = {
    hotStreakPreCasts: HotStreakPreCasts,
    eventHistory: EventHistory,
  };
  protected hotStreakPreCasts!: HotStreakPreCasts;
  protected eventHistory!: EventHistory;

  hasPyroclasm: boolean;
  totalHotStreakProcs = 0;
  expiredProcs = 0;
  hotStreakRemoved = 0;

  constructor(options: Options) {
    super(options);
    this.hasPyroclasm = this.selectedCombatant.hasTalent(SPELLS.PYROCLASM_TALENT.id);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.HOT_STREAK), this.onHotStreakApplied);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.HOT_STREAK), this.checkForExpiredProcs);

  }

  //Count the number of times Hot Streak was applied
  onHotStreakApplied(event: ApplyBuffEvent) {
    this.totalHotStreakProcs += 1;
  }

  //Checks to see if there was a Hot Streak spender cast immediately before Hot Streak was removed. If there was not, then it must have expired.
  checkForExpiredProcs(event: RemoveBuffEvent) {
    const lastCastEvent = this.eventHistory.last(1, MS_BUFFER_250, Events.cast.by(SELECTED_PLAYER).spell([SPELLS.PYROBLAST,SPELLS.FLAMESTRIKE]))
    if (lastCastEvent.length === 0) {
      debug && this.log("Hot Streak proc expired");
      this.expiredProcs += 1;
    }
  }

  get usedProcs() {
    return this.totalHotStreakProcs - this.expiredProcs;
  }

  get expiredProcsPercent() {
    return (this.expiredProcs / this.totalHotStreakProcs) || 0;
  }

  get hotStreakUtil() {
    return 1 - (this.expiredProcs / this.totalHotStreakProcs) || 0;
  }

  get hotStreakUtilizationThresholds() {
    return {
      actual: this.hotStreakUtil,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.80,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.hotStreakUtilizationThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You allowed {formatPercentage(this.expiredProcsPercent)}% of your <SpellLink id={SPELLS.HOT_STREAK.id} /> procs to expire. Try to use your procs as soon as possible to avoid this.</>)
          .icon(SPELLS.HOT_STREAK.icon)
          .actual(<Trans id="mage.fire.suggestions.hotStreak.expired">{formatPercentage(this.hotStreakUtil)}% expired</Trans>)
          .recommended(`<${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(15)}
        size="flexible"
        tooltip={(
          <>
            Hot Streak is a big part of your rotation and therefore it is important that you use all the procs that you get and avoid letting them expire. <br /><br />
            Additionally, to maximize your chance of getting Heating Up/Hot Streak procs, you should hard cast Fireball{this.hasPyroclasm ? ' (or Pyroblast if you have a Pyroclasm proc)' : ''} just before using your Hot Streak proc unless you are guaranteed to crit via Firestarter, Searing Touch, or Combustion. This way if one of the two spells crit you will get a new Heating Up proc, and if both spells crit then you will get a new Hot Streak proc.
            <br />
            <ul>
              <li>Total procs - {this.totalHotStreakProcs}</li>
              <li>Used procs - {this.usedProcs}</li>
              <li>Expired procs - {this.expiredProcs}</li>
              <li>Procs used without a Fireball - {this.hotStreakPreCasts.noCastBeforeHotStreak}</li>
            </ul>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.HOT_STREAK}>
          <>
            {formatPercentage(this.hotStreakUtil,0)}% <small>Proc Utilization</small><br />
            {formatPercentage(this.hotStreakPreCasts.castBeforeHotStreakUtil,0)}% <small>Procs used alongside Fireball</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HotStreak;
