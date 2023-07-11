import { Trans } from '@lingui/macro';
import {
  MS_BUFFER_100,
  MS_BUFFER_250,
  COMBUSTION_DURATION,
  SKB_COMBUST_DURATION,
} from 'analysis/retail/mage/shared';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { CastEvent, ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import EventHistory from 'parser/shared/modules/EventHistory';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const debug = false;

class SunKingsBlessing extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
  };
  protected eventHistory!: EventHistory;

  expiredBuffs = 0;
  sunKingApplied = 0;
  sunKingTotalDelay = 0;
  totalSunKingBuffs = 0;
  combustionCastDuringCombustion = 0;
  wastedHotStreaks = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SUN_KINGS_BLESSING_TALENT);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SUN_KINGS_BLESSING_BUFF_STACK),
      this.onStackRemoved,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SUN_KINGS_BLESSING_BUFF),
      this.onSunKingApplied,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.COMBUSTION_TALENT),
      this.onCombustionStart,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.COMBUSTION_TALENT),
      this.onCombustionCast,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SUN_KINGS_BLESSING_BUFF),
      this.onSunKingRemoved,
    );
  }

  onStackRemoved(event: RemoveBuffEvent) {
    const lastCast = this.eventHistory.last(
      1,
      MS_BUFFER_100,
      Events.cast.by(SELECTED_PLAYER).spell([TALENTS.PYROBLAST_TALENT, SPELLS.FLAMESTRIKE]),
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
        Events.begincast.by(SELECTED_PLAYER).spell(TALENTS.PYROBLAST_TALENT),
      );
      const lastPyroCast = this.eventHistory.last(
        1,
        MS_BUFFER_250,
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS.PYROBLAST_TALENT),
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

  onCombustionCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(TALENTS.COMBUSTION_TALENT.id)) {
      this.combustionCastDuringCombustion += 1;
    }
  }

  onSunKingRemoved(event: RemoveBuffEvent) {
    const sunKingStart = this.eventHistory.last(
      1,
      undefined,
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SUN_KINGS_BLESSING_BUFF),
    )[0];
    const hotStreaksDuringBuff = this.eventHistory.last(
      undefined,
      event.timestamp - sunKingStart.timestamp,
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.HOT_STREAK),
    );
    if (hotStreaksDuringBuff.length > 0) {
      hotStreaksDuringBuff.forEach((buff) => {
        if (event.timestamp - buff.timestamp > 50 && buff.timestamp - sunKingStart.timestamp > 50) {
          this.wastedHotStreaks += 1;
        }
      });
    }
  }

  get averageSunKingDelaySeconds() {
    return this.sunKingTotalDelay / this.totalSunKingBuffs / 1000;
  }

  get percentSunKingBuffExpired() {
    return this.expiredBuffs / this.totalSunKingBuffs;
  }

  get combustionDuringCombustionThresholds() {
    return {
      actual: this.combustionCastDuringCombustion,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 2,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get sunKingExpireThresholds() {
    return {
      actual: this.percentSunKingBuffExpired,
      isGreaterThan: {
        minor: 0.1,
        average: 0.2,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.combustionDuringCombustionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You used <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> while{' '}
          <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> was already active{' '}
          {this.combustionCastDuringCombustion} times. When using{' '}
          <SpellLink spell={TALENTS.SUN_KINGS_BLESSING_TALENT} /> and{' '}
          <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> at the same time, you want to ensure that{' '}
          <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> is activated first by using{' '}
          <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> just before your hard cast{' '}
          <SpellLink spell={TALENTS.PYROBLAST_TALENT} /> finishes casting. This is due to an odd
          interaction where if <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> is used while{' '}
          <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> is already active (via{' '}
          <SpellLink spell={TALENTS.SUN_KINGS_BLESSING_TALENT} />) then the time remaining on{' '}
          <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> will be reset to{' '}
          {COMBUSTION_DURATION / 1000}sec instead of adding to it. But if{' '}
          <SpellLink spell={TALENTS.SUN_KINGS_BLESSING_TALENT} /> is activated after{' '}
          <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> it will add {SKB_COMBUST_DURATION / 1000}
          sec to your <SpellLink spell={TALENTS.COMBUSTION_TALENT} />.
        </>,
      )
        .icon(TALENTS.SUN_KINGS_BLESSING_TALENT.icon)
        .actual(
          <Trans id="mage.fire.suggestions.sunKingsBlessing.combustionDuringCombustion">
            {formatNumber(actual)} bad uses
          </Trans>,
        )
        .recommended(`${formatNumber(recommended)} is recommended`),
    );
    when(this.sunKingExpireThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You let <SpellLink spell={TALENTS.SUN_KINGS_BLESSING_TALENT} /> expire {this.expiredBuffs}{' '}
          times ({formatPercentage(this.percentSunKingBuffExpired)}% of total{' '}
          <SpellLink spell={TALENTS.SUN_KINGS_BLESSING_TALENT} /> buffs). While this is sometimes
          unavoidable, try to ensure you are using your{' '}
          <SpellLink spell={TALENTS.SUN_KINGS_BLESSING_TALENT} /> procs instead of letting them
          expire.
        </>,
      )
        .icon(TALENTS.SUN_KINGS_BLESSING_TALENT.icon)
        .actual(
          <Trans id="mage.fire.suggestions.sunKingsBlessing.expiredProcs">
            {formatPercentage(actual)}% expired procs
          </Trans>,
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            This shows the average time that the Sun King's Blessing buff was available before the
            player activated it by hardcasting Pyroblast. This only includes the time from when the
            buff became available (after the 8th Hot Streak) until the hardcast Pyroblast was
            started, it does not include the amount of time that it took to hardcast Pyroblast. A
            "Wasted Hot Streak" indicates a Hot Streak that was used while you had the buff to
            activate Sun King's Blessing. Essentially this is considered wasted because it could
            have contributed towards stacking to the next Sun King's Blessing.
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.SUN_KINGS_BLESSING_BUFF}>
          {this.averageSunKingDelaySeconds.toFixed(2)}s{' '}
          <small>Avg. Sun King Activation Delay</small>
          <br />
          {this.expiredBuffs} <small>Expired Sun King buffs</small>
          <br />
          {this.wastedHotStreaks} <small>Wasted Hot Streaks</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SunKingsBlessing;
