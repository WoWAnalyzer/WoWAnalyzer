import { formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import MeteorCombustion from 'analysis/retail/mage/fire/talents/MeteorCombustion';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class Meteor extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    enemies: Enemies,
    meteorCombustion: MeteorCombustion,
  };
  protected abilityTracker!: AbilityTracker;
  protected enemies!: Enemies;
  protected meteorCombustion!: MeteorCombustion;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.METEOR_TALENT);
  }

  get totalMeteorCasts() {
    return this.abilityTracker.getAbility(TALENTS.METEOR_TALENT.id).casts;
  }

  get meteorMaxCasts() {
    return Math.round(this.owner.fightDuration / 60000 - 0.3) + 1;
  }

  get meteorCastEfficiency() {
    return this.totalMeteorCasts / this.meteorMaxCasts;
  }

  get meteorEfficiencySuggestionThresholds() {
    return {
      actual: this.meteorCastEfficiency,
      isLessThan: {
        minor: 1,
        average: 1,
        major: 1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.meteorEfficiencySuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You could have cast <SpellLink spell={TALENTS.METEOR_TALENT} /> {this.meteorMaxCasts}{' '}
          times during this fight, but you only cast it {this.totalMeteorCasts} times. While you
          should not cast Meteor on cooldown (since you need to have it available for{' '}
          <SpellLink spell={TALENTS.COMBUSTION_TALENT} />
          ), you should be casting it at least once per minute.
        </>,
      )
        .icon(TALENTS.METEOR_TALENT.icon)
        .actual(`${formatPercentage(this.meteorCastEfficiency)}% Utilization`)
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This is a measure of how well you utilized your Meteor casts.
            <ul>
              <li>{this.totalMeteorCasts} Total Meteor casts</li>
              <li>{this.meteorMaxCasts} Adjusted max casts</li>
              <li>{this.meteorCombustion.badCasts()} Meteor casts without Combustion</li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.METEOR_TALENT}>
          <>
            {formatPercentage(this.meteorCastEfficiency, 0)}%{' '}
            <small>Adjusted Cast Efficiency</small>
            <br />
            {formatPercentage(this.meteorCombustion.combustionUtilization, 0)}%{' '}
            <small>Utilization during Combustion</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Meteor;
