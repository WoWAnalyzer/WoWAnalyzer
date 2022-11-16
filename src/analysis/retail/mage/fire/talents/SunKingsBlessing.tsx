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
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

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
    this.active = this.selectedCombatant.hasLegendary(SPELLS.SUN_KINGS_BLESSING);
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
      Events.cast.by(SELECTED_PLAYER).spell([TALENTS.PYROBLAST_TALENT, TALENTS.FLAMESTRIKE_TALENT]),
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
          You used <SpellLink id={TALENTS.COMBUSTION_TALENT.id} /> while{' '}
          <SpellLink id={TALENTS.COMBUSTION_TALENT.id} /> was already active{' '}
          {this.combustionCastDuringCombustion} times. When using{' '}
          <SpellLink id={SPELLS.SUN_KINGS_BLESSING.id} /> and{' '}
          <SpellLink id={TALENTS.COMBUSTION_TALENT.id} /> at the same time, you want to ensure that{' '}
          <SpellLink id={TALENTS.COMBUSTION_TALENT.id} /> is activated first by using{' '}
          <SpellLink id={TALENTS.COMBUSTION_TALENT.id} /> just before your hard cast{' '}
          <SpellLink id={TALENTS.PYROBLAST_TALENT.id} /> finishes casting. This is due to an odd
          interaction where if <SpellLink id={TALENTS.COMBUSTION_TALENT.id} /> is used while{' '}
          <SpellLink id={TALENTS.COMBUSTION_TALENT.id} /> is already active (via{' '}
          <SpellLink id={SPELLS.SUN_KINGS_BLESSING.id} />) then the time remaining on{' '}
          <SpellLink id={TALENTS.COMBUSTION_TALENT.id} /> will be reset to{' '}
          {COMBUSTION_DURATION / 1000}sec instead of adding to it. But if{' '}
          <SpellLink id={SPELLS.SUN_KINGS_BLESSING.id} /> is activated after{' '}
          <SpellLink id={TALENTS.COMBUSTION_TALENT.id} /> it will add {SKB_COMBUST_DURATION / 1000}
          sec to your <SpellLink id={TALENTS.COMBUSTION_TALENT.id} />.
        </>,
      )
        .icon(SPELLS.SUN_KINGS_BLESSING.icon)
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
          You let <SpellLink id={SPELLS.SUN_KINGS_BLESSING.id} /> expire {this.expiredBuffs} times (
          {formatPercentage(this.percentSunKingBuffExpired)}% of total{' '}
          <SpellLink id={SPELLS.SUN_KINGS_BLESSING.id} /> buffs). While this is sometimes
          unavoidable, try to ensure you are using your{' '}
          <SpellLink id={SPELLS.SUN_KINGS_BLESSING.id} /> procs instead of letting them expire.
        </>,
      )
        .icon(SPELLS.SUN_KINGS_BLESSING.icon)
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
        position={STATISTIC_ORDER.CORE(30)}
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
        <BoringSpellValueText spellId={SPELLS.SUN_KINGS_BLESSING_BUFF.id}>
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
