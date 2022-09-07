import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

const MINOR_THRESHOLD = 0;
const AVERAGE_THRESHOLD = 0.05;
const MAJOR_THRESHOLD = 0.1;

const DEBUG = false;

/**
 * Suggestions and stuff related to Starsurge usage
 */
class Starsurge extends Analyzer {
  totalStarsurgeCasts: number = 0;
  badStarsurgeCasts: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.STARSURGE_MOONKIN),
      this.onStarsurge,
    );
  }

  onStarsurge(event: CastEvent) {
    if (
      !this.selectedCombatant.hasBuff(SPELLS.ECLIPSE_SOLAR.id) &&
      !this.selectedCombatant.hasBuff(SPELLS.ECLIPSE_LUNAR.id)
    ) {
      DEBUG && console.log('Bad Starsurge @ ' + this.owner.formatTimestamp(event.timestamp));
      this.badStarsurgeCasts += 1;
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `You should only cast Starsurge during Eclipse!`;
    }
    this.totalStarsurgeCasts += 1;
  }

  get percentBadStarsurges() {
    return this.totalStarsurgeCasts === 0 ? 0 : this.badStarsurgeCasts / this.totalStarsurgeCasts;
  }

  get percentGoodStarsurges() {
    return 1 - this.percentBadStarsurges;
  }

  get suggestionThresholds() {
    return {
      actual: this.percentBadStarsurges,
      isGreaterThan: {
        minor: MINOR_THRESHOLD,
        average: AVERAGE_THRESHOLD,
        major: MAJOR_THRESHOLD,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get goodCastSuggestionThresholds() {
    return {
      actual: this.percentGoodStarsurges,
      isLessThan: {
        minor: 1 - MINOR_THRESHOLD,
        average: 1 - AVERAGE_THRESHOLD,
        major: 1 - MAJOR_THRESHOLD,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink id={SPELLS.STARSURGE_MOONKIN.id} /> not during an{' '}
          <SpellLink id={SPELLS.ECLIPSE.id} /> {this.badStarsurgeCasts} times -{' '}
          {formatPercentage(actual, 1)}% of total Starsurge casts. You should only cast Starsurge
          during an Eclipse.
        </>,
      )
        .icon(SPELLS.ECLIPSE.icon)
        .actual(`${formatPercentage(actual, 1)}% wrong Starsurge casts`)
        .recommended(`none are recommended`),
    );
  }
}

export default Starsurge;
