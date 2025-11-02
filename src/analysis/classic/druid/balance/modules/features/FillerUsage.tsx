import SPELLS from 'common/SPELLS/classic/druid';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';

const MINOR_THRESHOLD = 0;
const AVERAGE_THRESHOLD = 0.05;
const MAJOR_THRESHOLD = 0.1;

const ECLIPSE_FILLER = [
  [SPELLS.ECLIPSE_LUNAR, SPELLS.STARFIRE],
  [SPELLS.ECLIPSE_SOLAR, SPELLS.WRATH],
];

class FillerUsage extends Analyzer {
  totalFillerCasts = 0;
  badFillerCasts = 0;

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
        addInefficientCastReason(
          event,
          `Wrong usage of ${event.ability.name} during ${eclipse.name}. Use ${spell.name} instead`,
        );
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
}

export default FillerUsage;
