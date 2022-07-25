import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { SpellIcon } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { EventType } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import EventHistory from 'parser/shared/modules/EventHistory';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { FIRESTARTER_THRESHOLD, SEARING_TOUCH_THRESHOLD } from '@wowanalyzer/mage';
import StandardChecks from '@wowanalyzer/mage/src/StandardChecks';

class HeatingUp extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
    standardChecks: StandardChecks,
  };
  protected eventHistory!: EventHistory;
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
    casts = casts.filter((cast) => {
      const targetHealth = this.standardChecks.getTargetHealth(cast);
      return !this.hasSearingTouch || (targetHealth && targetHealth > SEARING_TOUCH_THRESHOLD);
    });

    //Filter out events where the player has Firestarter and the target is over 90% health.
    casts = casts.filter((cast) => {
      const targetHealth = this.standardChecks.getTargetHealth(cast);
      return !this.hasFirestarter || (targetHealth && targetHealth < FIRESTARTER_THRESHOLD);
    });

    //Filter out events where the player is Venthyr and Mirrors of Torment is currently being cast
    casts = casts.filter((cast) => {
      const lastEvent = this.eventHistory.last(
        1,
        1000,
        Events.begincast.by(SELECTED_PLAYER),
        cast.timestamp,
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

  get fireBlastUtil() {
    return (
      1 -
      (this.fireBlastWithoutHeatingUp() + this.fireBlastDuringHotStreak()) /
        this.standardChecks.countEvents(EventType.Cast, SPELLS.FIRE_BLAST)
    );
  }

  get phoenixFlamesUtil() {
    return (
      1 -
      this.phoenixFlamesDuringHotStreak() /
        this.standardChecks.countEvents(EventType.Cast, SPELLS.PHOENIX_FLAMES)
    );
  }

  get fireBlastUtilSuggestionThresholds() {
    return {
      actual: this.fireBlastUtil,
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
      actual: this.phoenixFlamesUtil,
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
            {formatPercentage(this.fireBlastUtil)}% Utilization
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
            {formatPercentage(this.phoenixFlamesUtil)}% Utilization
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
            <SpellIcon id={SPELLS.FIRE_BLAST.id} /> {formatPercentage(this.fireBlastUtil, 0)}%{' '}
            <small>Fire Blast Utilization</small>
            <br />
            <SpellIcon id={SPELLS.PHOENIX_FLAMES.id} />{' '}
            {formatPercentage(this.phoenixFlamesUtil, 0)}% <small>Phoenix Flames Utilization</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HeatingUp;
