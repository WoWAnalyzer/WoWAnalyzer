import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, GetRelatedEvents } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

class MeteorCombustion extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  meteorCasts: { cast: CastEvent; damage: DamageEvent | undefined; combustionActive: boolean }[] =
    [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.METEOR_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.METEOR_TALENT),
      this.onMeteor,
    );
  }

  onMeteor(event: CastEvent) {
    const damage: DamageEvent[] | undefined = GetRelatedEvents(event, 'SpellDamage');
    const combustion = damage
      ? this.selectedCombatant.hasBuff(TALENTS.COMBUSTION_TALENT.id, damage[0]?.timestamp)
      : false;
    this.meteorCasts.push({
      cast: event,
      damage: damage[0],
      combustionActive: combustion,
    });
  }

  badCasts = () => {
    const badCasts = this.meteorCasts.filter((m) => !m.combustionActive);
    return badCasts.length;
  };

  get totalMeteorCasts() {
    return this.meteorCasts.length;
  }

  get totalCombustionCasts() {
    return this.abilityTracker.getAbility(TALENTS.COMBUSTION_TALENT.id).casts;
  }

  get combustionWithoutMeteor() {
    return this.totalCombustionCasts - this.badCasts();
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
          You failed to cast <SpellLink spell={TALENTS.METEOR_TALENT} /> during{' '}
          <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> {this.badCasts()} times. In order to make
          the most of Combustion and <SpellLink spell={SPELLS.IGNITE} />, you should always ensure
          Meteor hits the target during Combustion. If Meteor will not come off cooldown before
          Combustion is available, then you should hold Meteor for Combustion.
        </>,
      )
        .icon(TALENTS.METEOR_TALENT.icon)
        .actual(`${formatPercentage(this.combustionUtilization)}% Utilization`)
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default MeteorCombustion;
