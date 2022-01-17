import { Trans } from '@lingui/macro';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { BeginCastEvent, CastEvent, EventType } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import EventHistory from 'parser/shared/modules/EventHistory';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class CombustionSpellUsage extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
    eventHistory: EventHistory,
  };
  protected spellUsable!: SpellUsable;
  protected abilityTracker!: AbilityTracker;
  protected eventHistory!: EventHistory;

  scorchCastsStarted = 0;
  scorchCastsCompleted = 0;
  fireballCastsStarted = 0;
  fireballCastsCompleted = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FIREBALL),
      this.fireballCasts,
    );
    this.addEventListener(
      Events.begincast.by(SELECTED_PLAYER).spell(SPELLS.FIREBALL),
      this.fireballCasts,
    );
  }

  //Because Fireball has a longer cast time than Scorch, the player should never cast Fireball during Combustion.
  fireballCasts(event: CastEvent | BeginCastEvent) {
    const hasCombustion = this.selectedCombatant.hasBuff(SPELLS.COMBUSTION.id);

    if (!hasCombustion) {
      return;
    }

    const combustionApplied = this.eventHistory.last(
      1,
      undefined,
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.COMBUSTION),
    )[0].timestamp;
    if (
      event.type === EventType.Cast &&
      (!event.channel?.beginChannel || event.channel.beginChannel.timestamp >= combustionApplied)
    ) {
      this.fireballCastsCompleted += 1;
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `This Fireball was cast during Combustion. Since Combustion has a short duration, you are better off using your instant abilities to get as many instant/free Pyroblasts as possible. If you run out of instant abilities, cast Scorch instead since it has a shorter cast time.`;
    }

    if (event.type === EventType.BeginCast) {
      this.fireballCastsStarted += 1;
    }
  }

  get fireballCastsPerCombustion() {
    return this.fireballCastsStarted / this.combustionCasts;
  }

  get combustionCasts() {
    return this.abilityTracker.getAbility(SPELLS.COMBUSTION.id).casts;
  }

  get fireballDuringCombustionThresholds() {
    return {
      actual: this.fireballCastsPerCombustion,
      isGreaterThan: {
        minor: 0,
        average: 0.5,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.fireballDuringCombustionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You started to cast <SpellLink id={SPELLS.FIREBALL.id} /> {this.fireballCastsStarted}{' '}
          times ({this.fireballCastsPerCombustion.toFixed(2)} per Combustion), and completed{' '}
          {this.fireballCastsCompleted} casts, during <SpellLink id={SPELLS.COMBUSTION.id} />.
          Combustion has a short duration, so you are better off using instant abilities like{' '}
          <SpellLink id={SPELLS.FIRE_BLAST.id} /> or <SpellLink id={SPELLS.PHOENIX_FLAMES.id} />. If
          you run out of instant cast abilities, use <SpellLink id={SPELLS.SCORCH.id} /> instead of
          Fireball since it has a shorter cast time.
        </>,
      )
        .icon(SPELLS.COMBUSTION.icon)
        .actual(
          <Trans id="mage.fire.suggestions.combustion.castsPerCombustion">
            {this.fireballCastsPerCombustion.toFixed(2)} Casts Per Combustion
          </Trans>,
        )
        .recommended(`${formatNumber(recommended)} is recommended`),
    );
  }
}
export default CombustionSpellUsage;
