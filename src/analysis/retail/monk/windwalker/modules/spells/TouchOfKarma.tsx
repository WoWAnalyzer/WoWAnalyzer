import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

const TOUCH_OF_KARMA_HP_SCALING = 0.5;

class TouchOfKarma extends Analyzer {
  static dependencies = {
    healingDone: HealingDone,
  };

  protected healingDone!: HealingDone;

  totalPossibleAbsorb = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TOUCH_OF_KARMA_CAST),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    this.totalPossibleAbsorb += (event.maxHitPoints || 0) * TOUCH_OF_KARMA_HP_SCALING;
  }

  get absorbUsed() {
    return (
      this.healingDone.byAbility(SPELLS.TOUCH_OF_KARMA_CAST.id).effective / this.totalPossibleAbsorb
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.absorbUsed,
      isLessThan: {
        minor: 0.8,
        average: 0.65,
        major: 0.5,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          {' '}
          You consumed a low amount of your total <SpellLink
            spell={SPELLS.TOUCH_OF_KARMA_CAST}
          />{' '}
          absorb. It's best used when you can take enough damage to consume most of the absorb.
          Getting full absorb usage shouldn't be expected on lower difficulty encounters{' '}
        </>,
      )
        .icon(SPELLS.TOUCH_OF_KARMA_CAST.icon)
        .actual(
          defineMessage({
            id: 'monk.windwalker.suggestions.touchOfKarma.absorbUsed',
            message: `${formatPercentage(actual)}% Touch of Karma absorb used`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        tooltip="This does not account for possible absorbs from missed Touch of Karma casts"
      >
        <BoringSpellValueText spell={SPELLS.TOUCH_OF_KARMA_CAST}>
          {formatPercentage(this.absorbUsed, 0)}% <small>Absorb used</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={SPELLS.TOUCH_OF_KARMA_CAST} />
        </b>{' '}
        is both a defensive and offensive cooldown, although it is mostly used offensively. It
        should be used any time enough damage will be taken to break the shield.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={SPELLS.TOUCH_OF_KARMA_CAST} /> cast efficiency
          </strong>
          {this.guideSubStatistic()}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }

  guideSubStatistic() {
    return (
      <CastEfficiencyBar
        spellId={SPELLS.TOUCH_OF_KARMA_CAST.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }
}

export default TouchOfKarma;
