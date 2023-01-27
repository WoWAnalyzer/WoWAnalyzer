import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Combatants from 'parser/shared/modules/Combatants';
import Lifebind from './Lifebind';

class EmeraldCommunion extends Analyzer {
  static dependencies = {
    lifebind: Lifebind,
    combatants: Combatants,
  };
  protected combatants!: Combatants;
  protected lifebind!: Lifebind;
  numCasts: number = 0;
  totalLifebindTargets: number = 0;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_EVOKER.EMERALD_COMMUNION_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS_EVOKER.LIFEBIND_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.EMERALD_COMMUNION_TALENT),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    this.numCasts += 1;
    this.totalLifebindTargets += this.lifebind.curNumLifebinds;
  }

  get percentWithLifebindOnCast() {
    return this.totalLifebindTargets / this.numCasts / this.combatants.playerCount;
  }

  get suggestionThresholds() {
    return {
      actual: this.percentWithLifebindOnCast,
      isLessThan: {
        major: 0.65,
        average: 0.75,
        minor: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to make sure that you buff as many players as possible with{' '}
          <SpellLink id={TALENTS_EVOKER.LIFEBIND_TALENT} /> prior to casting{' '}
          <SpellLink id={TALENTS_EVOKER.EMERALD_COMMUNION_TALENT} />.
        </>,
      )
        .icon(TALENTS_EVOKER.EMERALD_COMMUNION_TALENT.icon)
        .actual(
          `${formatPercentage(this.percentWithLifebindOnCast, 2)}${t({
            id: 'evoker.preservation.suggestions.emeraldCommunion.numLifebinds',
            message: `% of group with Lifebind when casting Emerald Communion`,
          })}`,
        )
        .recommended(`${recommended * 100}% or more is recommended`),
    );
  }
}

export default EmeraldCommunion;
