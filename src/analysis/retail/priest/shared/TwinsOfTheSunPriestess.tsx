import { t } from '@lingui/macro';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class TwinsOfTheSunPriestess extends Analyzer {
  // More could probably be done with this to analyze what the person you used it on did.
  // this is at least a base of making sure they're using PI on other players and not wasting it on themself.

  goodCasts = 0;
  badCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(
      TALENTS_PRIEST.TWINS_OF_THE_SUN_PRIESTESS_TALENT.id,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.POWER_INFUSION_TALENT),
      this.onCast,
    );
  }

  get totalCasts() {
    return this.badCasts + this.goodCasts;
  }

  onCast(event: CastEvent) {
    if (event.targetID === event.sourceID) {
      this.badCasts += 1;
    } else {
      this.goodCasts += 1;
    }
  }

  get suggestionThresholds() {
    return {
      actual: this.badCasts,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    const castsPlural = this.badCasts === 1 ? 'cast' : 'casts';
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You had {this.badCasts} bad {castsPlural} of{' '}
          <SpellLink id={TALENTS.POWER_INFUSION_TALENT.id} /> by using it on yourself. When taking
          this legendary, make sure to always use it on an ally. By using it on yourself, you lose
          out on a free <SpellLink id={TALENTS.POWER_INFUSION_TALENT.id} /> for a raid member.
        </>,
      )
        .icon(SPELLS.TWINS_OF_THE_SUN_PRIESTESS.icon)
        .actual(
          t({
            id: 'priest.shared.legendaries.twinsOfTheSunPriestess.efficiency',
            message: `You had ${this.badCasts} ${castsPlural} of Power Infusion on yourself.`,
          }),
        )
        .recommended(`No casts on yourself is recommended.`),
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(15)}
        size="flexible"
      >
        <BoringSpellValueText spellId={SPELLS.TWINS_OF_THE_SUN_PRIESTESS.id}>
          {formatNumber(this.goodCasts)}/{formatNumber(this.totalCasts)} Uses
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TwinsOfTheSunPriestess;
