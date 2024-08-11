import { COMBUSTION_DURATION, SKB_COMBUST_DURATION } from 'analysis/retail/mage/shared';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  ApplyBuffEvent,
  RemoveBuffEvent,
  GetRelatedEvent,
} from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class SunKingsBlessing extends Analyzer {
  totalProcs = 0;
  sunKingsBlessing: {
    buffApply: ApplyBuffEvent | undefined;
    buffRemove: RemoveBuffEvent;
    expired: boolean;
  }[] = [];
  combustCastDuringCombust = 0;
  hotStreaksWithFury = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SUN_KINGS_BLESSING_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FURY_OF_THE_SUN_KING),
      this.onSKBApply,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.FURY_OF_THE_SUN_KING),
      this.onSKBRemove,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.COMBUSTION_TALENT),
      this.onCombustCast,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.HOT_STREAK),
      this.onHotStreak,
    );
  }

  onSKBApply(event: ApplyBuffEvent) {
    this.totalProcs += 1;
  }

  onSKBRemove(event: RemoveBuffEvent) {
    const buffApply: ApplyBuffEvent | undefined = GetRelatedEvent(event, 'BuffApply');
    this.sunKingsBlessing.push({
      buffApply: buffApply,
      buffRemove: event,
      expired: !this.selectedCombatant.hasBuff(TALENTS.COMBUSTION_TALENT.id),
    });
  }

  onCombustCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(TALENTS.COMBUSTION_TALENT.id, event.timestamp - 10)) {
      return;
    }
    this.combustCastDuringCombust += 1;
  }

  onHotStreak(event: RemoveBuffEvent) {
    if (
      !this.selectedCombatant.hasBuff(SPELLS.FURY_OF_THE_SUN_KING.id) ||
      !this.selectedCombatant.hasBuff(SPELLS.FURY_OF_THE_SUN_KING.id, event.timestamp - 50)
    ) {
      return;
    }
    this.hotStreaksWithFury += 1;
  }

  sunKingsBuffExpired = () => {
    const expiredProcs = this.sunKingsBlessing.filter((p) => p.expired);
    return expiredProcs.length;
  };

  get percentSunKingBuffExpired() {
    return this.sunKingsBuffExpired() / this.totalProcs;
  }

  get averageHotStreaksWithSKB() {
    return this.hotStreaksWithFury / this.totalProcs;
  }

  get combustionDuringCombustionThresholds() {
    return {
      actual: this.combustCastDuringCombust,
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
        minor: 0,
        average: 0.1,
        major: 0.2,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get hotStreaksWithSKBThresholds() {
    return {
      actual: this.averageHotStreaksWithSKB,
      isGreaterThan: {
        minor: 1,
        average: 2,
        major: 3,
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
          {this.combustCastDuringCombust} times. When using{' '}
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
        .actual(`${formatNumber(actual)} bad uses`)
        .recommended(`${formatNumber(recommended)} is recommended`),
    );
    when(this.sunKingExpireThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You let <SpellLink spell={TALENTS.SUN_KINGS_BLESSING_TALENT} /> expire{' '}
          {this.sunKingsBuffExpired()} times ({formatPercentage(this.percentSunKingBuffExpired)}% of
          total <SpellLink spell={TALENTS.SUN_KINGS_BLESSING_TALENT} /> buffs). While this is
          sometimes unavoidable, try to ensure you are using your{' '}
          <SpellLink spell={TALENTS.SUN_KINGS_BLESSING_TALENT} /> procs instead of letting them
          expire.
        </>,
      )
        .icon(TALENTS.SUN_KINGS_BLESSING_TALENT.icon)
        .actual(`${formatPercentage(actual)}% expired procs`)
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
    when(this.hotStreaksWithSKBThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You used <SpellLink spell={SPELLS.HOT_STREAK} /> {this.hotStreaksWithFury} times (
          {this.averageHotStreaksWithSKB} per{' '}
          <SpellLink spell={TALENTS.SUN_KINGS_BLESSING_TALENT} />) while{' '}
          <SpellLink spell={SPELLS.FURY_OF_THE_SUN_KING} /> was ready. These{' '}
          <SpellLink spell={SPELLS.HOT_STREAK} /> were wasted and could have been contributing
          towards your next <SpellLink spell={TALENTS.SUN_KINGS_BLESSING_TALENT} />. To avoid this,
          ensure you are using <SpellLink spell={TALENTS.SUN_KINGS_BLESSING_TALENT} /> as quickly as
          possible when it is available.
        </>,
      )
        .icon(TALENTS.SUN_KINGS_BLESSING_TALENT.icon)
        .actual(`${formatNumber(actual)}wasted Hot Streaks`)
        .recommended(`<${formatNumber(recommended)} is recommended`),
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
        <BoringSpellValueText spell={SPELLS.FURY_OF_THE_SUN_KING}>
          {this.sunKingsBuffExpired()} <small>Expired Sun King buffs</small>
          <br />
          {this.hotStreaksWithFury} <small>Wasted Hot Streaks</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SunKingsBlessing;
