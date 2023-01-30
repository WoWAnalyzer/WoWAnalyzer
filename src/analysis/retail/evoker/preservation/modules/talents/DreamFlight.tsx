import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent } from 'parser/core/Events';
import { formatPercentage } from 'common/format';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { t } from '@lingui/macro';
import { SpellLink } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Combatants from 'parser/shared/modules/Combatants';

class DreamFlight extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  protected combatants!: Combatants;
  numCasts: number = 0;
  numApply: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.DREAM_FLIGHT_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DREAM_FLIGHT_HEAL),
      this.onApply,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.DREAM_FLIGHT_TALENT),
      this.onCast,
    );
  }

  onApply(event: ApplyBuffEvent) {
    if (!this.combatants.getEntity(event)) {
      return;
    }
    this.numApply += 1;
  }

  onCast(event: CastEvent) {
    this.numCasts += 1;
  }

  get percentOfGroupHit() {
    if (!this.numCasts) {
      return 0;
    }
    const averageHit = this.numApply / this.numCasts;
    return averageHit / Object.keys(this.combatants.getEntities()).length;
  }

  get suggestionThresholds() {
    return {
      actual: this.percentOfGroupHit,
      isLessThan: {
        major: 0.5,
        average: 0.6,
        minor: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={TALENTS_EVOKER.DREAM_FLIGHT_TALENT.id} /> is not hitting enough
          targets.
        </>,
      )
        .icon(TALENTS_EVOKER.DREAM_FLIGHT_TALENT.icon)
        .actual(
          `${formatPercentage(this.percentOfGroupHit, 2)}${t({
            id: 'evoker.preservation.suggestions.dreamFlight.targetsHit',
            message: `% of group hit with Dream Flight`,
          })}`,
        )
        .recommended(`${recommended * 100}% or more is recommended`),
    );
  }
}

export default DreamFlight;
