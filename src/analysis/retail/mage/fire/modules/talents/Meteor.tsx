import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import MeteorCombustion from './MeteorCombustion';
import MeteorRune from './MeteorRune';

class Meteor extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    enemies: Enemies,
    meteorRune: MeteorRune,
    meteorCombustion: MeteorCombustion,
  };
  protected abilityTracker!: AbilityTracker;
  protected enemies!: Enemies;
  protected meteorRune!: MeteorRune;
  protected meteorCombustion!: MeteorCombustion;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.METEOR_TALENT.id);
  }

  get totalMeteorCasts() {
    return this.abilityTracker.getAbility(SPELLS.METEOR_TALENT.id).casts;
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
          You could have cast <SpellLink id={SPELLS.METEOR_TALENT.id} /> {this.meteorMaxCasts} times
          during this fight, but you only cast it {this.totalMeteorCasts} times. While you should
          not cast Meteor on cooldown (since you need to have it available for{' '}
          <SpellLink id={SPELLS.COMBUSTION.id} />
          ), you should be casting it at least once per minute.
        </>,
      )
        .icon(SPELLS.METEOR_TALENT.icon)
        .actual(
          <Trans id="mage.fire.suggestions.meteor.efficiency">
            {formatPercentage(this.meteorCastEfficiency)}% Utilization
          </Trans>,
        )
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
              <li>
                {this.meteorRune.totalMeteorCasts - this.meteorRune.badMeteor} Meteor casts during
                Rune of Power
              </li>
              <li>{this.meteorRune.badMeteor} Meteor casts without Rune of Power</li>
              <li>
                {this.meteorCombustion.combustionWithoutMeteor} Combustion casts without Meteor
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.METEOR_TALENT.id}>
          <>
            {formatPercentage(this.meteorCastEfficiency, 0)}%{' '}
            <small>Adjusted Cast Efficiency</small>
            <br />
            {formatPercentage(this.meteorRune.meteorUtilization, 0)}%{' '}
            <small>Overall Utilization</small>
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
