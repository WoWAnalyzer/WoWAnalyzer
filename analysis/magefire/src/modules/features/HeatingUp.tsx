import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { SpellIcon } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { FIRESTARTER_THRESHOLD, SEARING_TOUCH_THRESHOLD } from '@wowanalyzer/mage';
import StandardChecks from '@wowanalyzer/mage/src/StandardChecks';

class HeatingUp extends Analyzer {
  static dependencies = {
    standardChecks: StandardChecks,
  };
  protected standardChecks!: StandardChecks;

  hasFirestarter: boolean = this.selectedCombatant.hasTalent(SPELLS.FIRESTARTER_TALENT.id);
  hasSearingTouch: boolean = this.selectedCombatant.hasTalent(SPELLS.SEARING_TOUCH_TALENT.id);

  phoenixFlamesDuringHotStreak = () =>
    this.standardChecks.countEventsByBuff(
      true,
      SPELLS.HOT_STREAK,
      EventType.Cast,
      SPELLS.PHOENIX_FLAMES,
    );

  fireBlastDuringHotStreak = () =>
    this.standardChecks.countEventsByBuff(
      true,
      SPELLS.HOT_STREAK,
      EventType.Cast,
      SPELLS.FIRE_BLAST,
    );

  fireBlastWithoutHeatingUp = () => {
    let casts = this.standardChecks.getEventsByBuff(
      false,
      SPELLS.HEATING_UP,
      EventType.Cast,
      SPELLS.FIRE_BLAST,
    );

    //Filter out events where Combustion was active
    casts = casts.filter(
      (cast) => !this.selectedCombatant.hasBuff(SPELLS.COMBUSTION.id, cast.timestamp),
    );

    //Filter out events where the player has Searing Touch and the target is under 30% health
    //Filter out events where the player has Firestarter and the target is over 90% health
    casts = casts.filter((cast) => {
      const targetHealth = this.standardChecks.getTargetHealth(cast);
      if (this.hasFirestarter) {
        return targetHealth && targetHealth < FIRESTARTER_THRESHOLD;
      } else if (this.hasSearingTouch) {
        return targetHealth && targetHealth > SEARING_TOUCH_THRESHOLD;
      } else {
        return true;
      }
    });

    //Filter out events where the player is Venthyr and Mirrors of Torment is currently being cast
    casts = casts.filter((cast) => {
      const lastEvent = this.standardChecks.getEvents(
        true,
        EventType.BeginCast,
        1,
        cast.timestamp,
        1000,
      )[0];
      return !lastEvent || lastEvent.ability.guid !== SPELLS.MIRRORS_OF_TORMENT.id;
    });
    return casts.length;
  };

  get totalWasted() {
    return (
      this.fireBlastWithoutHeatingUp() +
      this.fireBlastDuringHotStreak() +
      this.phoenixFlamesDuringHotStreak()
    );
  }

  get fireBlastUtilSuggestionThresholds() {
    return {
      actual:
        1 -
        (this.fireBlastWithoutHeatingUp() + this.fireBlastDuringHotStreak()) /
          this.standardChecks.countEvents(EventType.Cast, SPELLS.FIRE_BLAST),
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
          this.standardChecks.countEvents(EventType.Cast, SPELLS.PHOENIX_FLAMES),
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
          You cast <SpellLink id={SPELLS.PHOENIX_FLAMES.id} /> {this.phoenixFlamesDuringHotStreak()}{' '}
          times while <SpellLink id={SPELLS.HOT_STREAK.id} /> was active. This is a waste as the{' '}
          <SpellLink id={SPELLS.PHOENIX_FLAMES.id} /> could have contributed towards the next{' '}
          <SpellLink id={SPELLS.HEATING_UP.id} /> or <SpellLink id={SPELLS.HOT_STREAK.id} />.
        </>,
      )
        .icon(SPELLS.PHOENIX_FLAMES.icon)
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
            <SpellIcon id={SPELLS.PHOENIX_FLAMES.id} />{' '}
            {formatPercentage(this.phoenixFlamesUtilSuggestionThresholds.actual, 0)}%{' '}
            <small>Phoenix Flames Utilization</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HeatingUp;
