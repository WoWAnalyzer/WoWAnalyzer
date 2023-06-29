import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';

const FR_WINDOW_MS = 5000;
const FR_MINIMUM_HP_HEAL = 0.05;

const HEAL_THRESHOLD = 0.2;
const HP_THRESHOLD = 0.7;

class FrenziedRegeneration extends Analyzer {
  _healModifier = 0.5;

  get healModifier() {
    return this._healModifier;
  }

  get charges() {
    return this._charges;
  }

  // and the target is above 70% HP at the time of the cast.
  get inefficientCasts() {
    return this.castData.filter(
      (cast) => cast.percentHeal <= HEAL_THRESHOLD && cast.percentHP >= HP_THRESHOLD,
    );
  }

  static dependencies = {
    statTracker: StatTracker,
  };
  castData = [];
  damageEventsInWindow = [];

  constructor(...args) {
    super(...args);
    const versModifier = this.statTracker.currentVersatilityPercentage;

    this._healModifier += versModifier; // TODO: Account for Haste buffs by asking the actual value on each event instead of in here
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FRENZIED_REGENERATION),
      this.onCast,
    );
    this.addEventListener(Events.cast.to(SELECTED_PLAYER), this.onDamage);
  }

  pruneDamageEvents(currentTimestamp) {
    // Remove old damage events that occurred outside the FR window
    while (
      this.damageEventsInWindow.length &&
      this.damageEventsInWindow[0].timestamp + FR_WINDOW_MS < currentTimestamp
    ) {
      this.damageEventsInWindow.shift();
    }
  }

  onCast(event) {
    const percentHP = event.hitPoints / event.maxHitPoints;
    // Minimum heal
    let percentHeal = FR_MINIMUM_HP_HEAL;

    this.pruneDamageEvents(event.timestamp);
    const damageTakenInWindow = this.damageEventsInWindow.reduce(
      (total, event) => total + event.damage,
      0,
    );

    // TODO: is event ordering consistent here? (this cast event needs to happen before GoE removebuff)
    const goeModifier = this.selectedCombatant.hasBuff(SPELLS.GUARDIAN_OF_ELUNE.id) ? 1.2 : 1;

    const healAmount = damageTakenInWindow * this.healModifier * goeModifier;
    const healAsPercentHP = healAmount / event.maxHitPoints;

    if (healAsPercentHP > percentHeal) {
      percentHeal = healAsPercentHP;
    }

    this.castData.push({
      percentHP,
      percentHeal,
      actualHeal: healAmount,
    });
  }

  // A cast is considered inefficient if the expected heal is less than 20% of max HP,

  onDamage(event) {
    this.damageEventsInWindow.push({
      timestamp: event.timestamp,
      damage: event.amount + event.absorbed,
    });
  }

  suggestions(when) {
    const inefficiency = this.inefficientCasts.length / this.castData.length;
    when(inefficiency)
      .isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <>
            You are casting <SpellLink spell={SPELLS.FRENZIED_REGENERATION} /> inefficiently (at
            high HP and after low damage intake). It is almost always better to wait until after you
            have taken a big hit to cast it, even if that means spending extended periods of time at
            maximum charges. If you don't already have one, consider getting an FR prediction
            weakaura to assist you in casting it more effectively.
          </>,
        )
          .icon(SPELLS.FRENZIED_REGENERATION.icon)
          .actual(
            `${formatPercentage(
              actual,
              0,
            )}% of casts had a predicted heal of less than ${formatPercentage(
              HEAL_THRESHOLD,
              0,
            )}% and were cast above ${formatPercentage(HP_THRESHOLD, 0)}% HP`,
          )
          .recommended(`${recommended}% is recommended`)
          .regular(recommended + 0.05)
          .major(recommended + 0.1),
      );
  }
}

export default FrenziedRegeneration;
