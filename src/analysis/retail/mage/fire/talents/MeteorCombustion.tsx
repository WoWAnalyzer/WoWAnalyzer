import TALENTS from 'common/TALENTS/mage';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, EventType, GetRelatedEvents } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
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
    const damage: DamageEvent[] | undefined = GetRelatedEvents(event, EventType.Damage);
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

  get combustionUtilization() {
    return 1 - this.badCasts() / this.totalMeteorCasts;
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
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export default MeteorCombustion;
