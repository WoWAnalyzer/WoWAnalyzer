import { Trans } from '@lingui/macro';
import {
  FIRESTARTER_THRESHOLD,
  SEARING_TOUCH_THRESHOLD,
  SharedCode,
} from 'analysis/retail/mage/shared';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink, SpellIcon } from 'interface';
import { highlightInefficientCast } from 'interface/report/Results/Timeline/Casts';
import Analyzer from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import CooldownHistory from 'parser/shared/modules/CooldownHistory';
import EventHistory from 'parser/shared/modules/EventHistory';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class HeatingUp extends Analyzer {
  static dependencies = {
    sharedCode: SharedCode,
    cooldownHistory: CooldownHistory,
    eventHistory: EventHistory,
  };
  protected sharedCode!: SharedCode;
  protected cooldownHistory!: CooldownHistory;
  protected eventHistory!: EventHistory;

  hasFirestarter: boolean = this.selectedCombatant.hasTalent(TALENTS.FIRESTARTER_TALENT.id);
  hasSearingTouch: boolean = this.selectedCombatant.hasTalent(TALENTS.SEARING_TOUCH_TALENT.id);
  hasFlameOn: boolean = this.selectedCombatant.hasTalent(TALENTS.FLAME_ON_TALENT.id);

  phoenixFlamesDuringHotStreak = () =>
    this.eventHistory.getEventsWithBuff(
      SPELLS.HOT_STREAK,
      EventType.Cast,
      TALENTS.PHOENIX_FLAMES_TALENT,
    ).length || 0;

  fireBlastDuringHotStreak = () =>
    this.eventHistory.getEventsWithBuff(SPELLS.HOT_STREAK, EventType.Cast, SPELLS.FIRE_BLAST)
      .length || 0;

  fireBlastWithoutHeatingUp = () => {
    let casts = this.eventHistory.getEventsWithoutBuff(
      SPELLS.HEATING_UP,
      EventType.Cast,
      SPELLS.FIRE_BLAST,
    );

    //If Hot Streak was active, filter it out (this is tracked separately)
    casts = casts.filter(
      (cast) => !this.selectedCombatant.hasBuff(SPELLS.HOT_STREAK.id, cast.timestamp),
    );

    //If Combustion was active, filter it out
    casts = casts.filter(
      (cast) => !this.selectedCombatant.hasBuff(TALENTS.COMBUSTION_TALENT.id, cast.timestamp),
    );

    //If Firestarter or Searing Touch was active, filter it out
    casts = casts.filter((cast) => {
      const targetHealth = this.sharedCode.getTargetHealth(cast);
      if (this.hasFirestarter) {
        return targetHealth && targetHealth < FIRESTARTER_THRESHOLD;
      } else if (this.hasSearingTouch) {
        return targetHealth && targetHealth > SEARING_TOUCH_THRESHOLD;
      } else {
        return true;
      }
    });

    //If the player was capped on charges, filter it out
    casts = casts.filter((cast) => {
      const maxCharges = 1 + this.selectedCombatant.getTalentRank(TALENTS.FLAME_ON_TALENT);
      const charges = this.cooldownHistory.chargesAvailable(SPELLS.FIRE_BLAST.id, cast.timestamp);
      return charges !== maxCharges;
    });

    //Highlight bad casts
    const tooltip =
      'This Fire Blast was cast without Heating Up, Combustion, Searing Touch, or Firestarter active.';
    casts.forEach((cast) => highlightInefficientCast(cast, tooltip));

    return casts.length;
  };

  get totalWasted() {
    return (
      this.fireBlastWithoutHeatingUp() +
      this.fireBlastDuringHotStreak() +
      this.phoenixFlamesDuringHotStreak()
    );
  }

  get totalFireBlasts() {
    return (
      this.eventHistory.getEvents(EventType.Cast, {
        searchBackwards: true,
        spell: SPELLS.FIRE_BLAST,
      }).length || 0
    );
  }

  get fireBlastUtilSuggestionThresholds() {
    return {
      actual:
        1 -
        (this.fireBlastWithoutHeatingUp() + this.fireBlastDuringHotStreak()) / this.totalFireBlasts,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get phoenixFlamesUtilSuggestionThresholds() {
    return {
      actual:
        1 -
          this.phoenixFlamesDuringHotStreak() /
            this.eventHistory.getEvents(EventType.Cast, {
              searchBackwards: true,
              spell: TALENTS.PHOENIX_FLAMES_TALENT,
            }).length || 0,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.fireBlastUtilSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink id={SPELLS.FIRE_BLAST.id} /> {this.fireBlastDuringHotStreak()} times
          while <SpellLink id={SPELLS.HOT_STREAK.id} /> was active and{' '}
          {this.fireBlastWithoutHeatingUp()} times while you didnt have{' '}
          <SpellLink id={SPELLS.HEATING_UP.id} />. Make sure that you are only using Fire Blast to
          convert Heating Up into Hot Streak or if you are going to cap on charges.
        </>,
      )
        .icon(SPELLS.FIRE_BLAST.icon)
        .actual(
          <Trans id="mage.fire.suggestions.heatingUp.fireBlastUtilization">
            {formatPercentage(this.fireBlastUtilSuggestionThresholds.actual)}% Utilization
          </Trans>,
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
    when(this.phoenixFlamesUtilSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink id={TALENTS.PHOENIX_FLAMES_TALENT.id} />{' '}
          {this.phoenixFlamesDuringHotStreak()} times while <SpellLink id={SPELLS.HOT_STREAK.id} />{' '}
          was active. This is a waste as the <SpellLink id={TALENTS.PHOENIX_FLAMES_TALENT.id} />{' '}
          could have contributed towards the next <SpellLink id={SPELLS.HEATING_UP.id} /> or{' '}
          <SpellLink id={SPELLS.HOT_STREAK.id} />.
        </>,
      )
        .icon(TALENTS.PHOENIX_FLAMES_TALENT.icon)
        .actual(
          <Trans id="mage.fire.suggestions.heatingUp.phoenixFlames.utilization">
            {formatPercentage(this.phoenixFlamesUtilSuggestionThresholds.actual)}% Utilization
          </Trans>,
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(14)}
        size="flexible"
        tooltip={
          <>
            Outside of Combustion & Firestarter, spells that are guaranteed to crit (like Fire
            Blast) should only be used to convert Heating Up into Hot Streak. While there are minor
            exceptions to this (like if you are about to cap on charges), the goal should be to
            waste as few of these as possible. Additionally, you should never cast Fire Blast or
            Phoenix Flames while Hot Streak is active, as those could have contributed towards your
            next Heating Up/Hot Streak
            <ul>
              <li>Fireblast used without Heating Up: {this.fireBlastWithoutHeatingUp()}</li>
              <li>Fireblast used during Hot Streak: {this.fireBlastDuringHotStreak()}</li>
              <li>Phoenix Flames used during Hot Streak: {this.phoenixFlamesDuringHotStreak()}</li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.HEATING_UP.id}>
          <>
            <SpellIcon id={SPELLS.FIRE_BLAST.id} />{' '}
            {formatPercentage(this.fireBlastUtilSuggestionThresholds.actual, 0)}%{' '}
            <small>Fire Blast Utilization</small>
            <br />
            <SpellIcon id={TALENTS.PHOENIX_FLAMES_TALENT.id} />{' '}
            {formatPercentage(this.phoenixFlamesUtilSuggestionThresholds.actual, 0)}%{' '}
            <small>Phoenix Flames Utilization</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HeatingUp;
