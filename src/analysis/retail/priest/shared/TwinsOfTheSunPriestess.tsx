import { t } from '@lingui/macro';
import { formatNumber } from 'common/format';
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
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

class TwinsOfTheSunPriestess extends Analyzer {
  // More could probably be done with this to analyze what the person you used it on did.
  // this is at least a base of making sure they're using PI on other players and not wasting it on themself.

  goodCasts = 0;
  badCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(
      TALENTS_PRIEST.TWINS_OF_THE_SUN_PRIESTESS_TALENT,
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
          <SpellLink spell={TALENTS.POWER_INFUSION_TALENT} /> by using it on yourself. When taking
          this talent, make sure to always use it on an ally. By using it on yourself, you lose out
          on a free <SpellLink spell={TALENTS.POWER_INFUSION_TALENT} /> for a raid member.
        </>,
      )
        .icon(TALENTS.TWINS_OF_THE_SUN_PRIESTESS_TALENT.icon)
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
        <BoringSpellValueText spell={TALENTS.TWINS_OF_THE_SUN_PRIESTESS_TALENT}>
          {formatNumber(this.goodCasts)}/{formatNumber(this.totalCasts)} Uses
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const allyPI = {
      count: this.goodCasts,
      label: 'Ally Casts',
    };

    const selfPI = {
      count: this.badCasts,
      label: 'Self Casts',
    };

    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS.TWINS_OF_THE_SUN_PRIESTESS_TALENT} />
        </b>{' '}
        gives you <SpellLink spell={TALENTS.POWER_INFUSION_TALENT} /> when used on an ally.
        <br />
        When taking this talent, make sure to always use it on an ally. By using it on yourself, you
        lose out on a free <SpellLink spell={TALENTS.POWER_INFUSION_TALENT} /> for a raid member.
      </p>
    );

    const data = (
      <div>
        <strong>Power Infusion Casts</strong>
        <GradiatedPerformanceBar good={allyPI} bad={selfPI} />
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default TwinsOfTheSunPriestess;
