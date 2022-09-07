import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { DamageEvent, ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Enemies from 'parser/shared/modules/Enemies';
import EventHistory from 'parser/shared/modules/EventHistory';

class MeteorCombustion extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    enemies: Enemies,
    eventHistory: EventHistory,
  };
  protected abilityTracker!: AbilityTracker;
  protected enemies!: Enemies;
  protected eventHistory!: EventHistory;

  lastRuneCast = 0;
  badMeteor = 0;
  meteorCast = false;
  meteorDuringCombustion = false;
  meteorInCombustion = 0;
  combustionActive = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.METEOR_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.METEOR_DAMAGE),
      this.onMeteorDamage,
    );
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.COMBUSTION),
      this.onCombustionStart,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.COMBUSTION),
      this.onCombustionEnd,
    );
  }

  onMeteorDamage(event: DamageEvent) {
    if (this.combustionActive) {
      this.meteorCast = true;
    }
  }

  onCombustionStart(event: ApplyBuffEvent) {
    //The Sun King's Blessing Legendary effect has a chance to trigger a 6sec Combust which was throwing this stat off, so we are just checking to see if Combustion was cast within 100ms of the buff being applied.
    const lastCast = this.eventHistory.last(
      1,
      100,
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.COMBUSTION),
    );
    if (lastCast.length !== 0) {
      this.combustionActive = true;
    }
  }

  onCombustionEnd(event: RemoveBuffEvent) {
    if (!this.combustionActive) {
      return;
    }

    if (this.meteorCast) {
      this.meteorInCombustion += 1;
    }
    this.combustionActive = false;
    this.meteorDuringCombustion = false;
  }

  get totalMeteorCasts() {
    return this.abilityTracker.getAbility(SPELLS.METEOR_TALENT.id).casts;
  }

  get totalCombustionCasts() {
    return this.abilityTracker.getAbility(SPELLS.COMBUSTION.id).casts;
  }

  get combustionWithoutMeteor() {
    return this.totalCombustionCasts - this.meteorInCombustion;
  }

  get combustionUtilization() {
    return 1 - this.combustionWithoutMeteor / this.totalCombustionCasts;
  }

  get meteorMaxCasts() {
    return Math.round(this.owner.fightDuration / 60000 - 0.3);
  }

  get meteorCastEfficiency() {
    console.log(Math.round(this.owner.fightDuration / 60000 - 0.25));
    return this.totalMeteorCasts / this.meteorMaxCasts;
  }

  get meteorCombustionSuggestionThresholds() {
    return {
      actual: this.combustionUtilization,
      isLessThan: {
        minor: 1,
        average: 1,
        major: 1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.meteorCombustionSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You failed to cast <SpellLink id={SPELLS.METEOR_TALENT.id} /> during{' '}
          <SpellLink id={SPELLS.COMBUSTION.id} /> {this.combustionWithoutMeteor} times. In order to
          make the most of Combustion and <SpellLink id={SPELLS.IGNITE.id} />, you should always
          cast Meteor during Combustion. If Meteor will not come off cooldown before Combustion is
          available, then you should hold Meteor for Combustion.
        </>,
      )
        .icon(SPELLS.METEOR_TALENT.icon)
        .actual(
          <Trans id="mage.fire.suggestions.meteor.combustion.utilization">
            {formatPercentage(this.combustionUtilization)}% Utilization
          </Trans>,
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default MeteorCombustion;
