import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/classic/druid';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

const MINOR_THRESHOLD = 0;
const AVERAGE_THRESHOLD = 0.05;
const MAJOR_THRESHOLD = 0.1;

const ECLIPSE_FILLER = [
  [SPELLS.ECLIPSE_LUNAR, SPELLS.STARFIRE],
  [SPELLS.ECLIPSE_SOLAR, SPELLS.WRATH],
];

class FillerUsage extends Analyzer {
  totalFillerCasts: number = 0;
  badFillerCasts: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(ECLIPSE_FILLER.map((p) => p[1])),
      this.onFillerCast,
    );
  }

  onFillerCast(event: CastEvent) {
    this.totalFillerCasts += 1;

    for (const [eclipse, spell] of ECLIPSE_FILLER) {
      if (this.selectedCombatant.hasBuff(eclipse.id) && event.ability.guid !== spell.id) {
        this.badFillerCasts += 1;
        event.meta = event.meta || {};
        event.meta.isInefficientCast = true;
        event.meta.inefficientCastReason = `Wrong usage of ${event.ability.name} during ${eclipse.name}. Use ${spell.name} instead`;
        return;
      }
    }
  }

  get percentBadFillers() {
    return this.badFillerCasts / this.totalFillerCasts || 0;
  }

  get percentGoodFillers() {
    return 1 - this.percentBadFillers;
  }

  get suggestionThresholds() {
    return {
      actual: this.percentBadFillers,
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
      actual: this.percentGoodFillers,
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
          You cast the wrong filler spell {this.badFillerCasts} times -{' '}
          {formatPercentage(actual, 1)}% of total filler casts. You should cast
          <ul>
            {ECLIPSE_FILLER.map(([eclipse, spell]) => (
              <li key={'eclipse-' + eclipse.id}>
                <SpellLink spell={spell} /> during and after <SpellLink spell={eclipse} />
              </li>
            ))}
          </ul>
        </>,
      )
        .icon(SPELLS.ECLIPSE_LUNAR.icon)
        .actual(
          t({
            id: 'druid.balance.suggestions.filler.efficiency',
            message: `${formatPercentage(actual, 1)}% wrong filler spell casts`,
          }),
        )
        .recommended(`none are recommended`),
    );
  }
}

export default FillerUsage;
