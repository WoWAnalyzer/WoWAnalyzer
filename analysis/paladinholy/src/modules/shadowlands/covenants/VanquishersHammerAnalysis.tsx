import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent, RemoveBuffStackEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

class VanquishersHammerAnalysis extends Analyzer {
  totalBuffs = 0;
  goodRemovals = 0;
  hasDBG = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NECROLORD.id);
    this.hasDBG = this.selectedCombatant.hasLegendary(SPELLS.DUTY_BOUND_GAVEL);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.spell(SPELLS.VANQUISHERS_HAMMER).by(SELECTED_PLAYER),
      this.HammerCast,
    );
    this.addEventListener(
      // this only fires when the Maraads buff is removed by LOTM, not when it naturally expires or is overwritten.
      Events.removebuffstack.spell(SPELLS.VANQUISHERS_HAMMER).by(SELECTED_PLAYER),
      this.BuffStacksRemoved,
    );
  }

  HammerCast(event: CastEvent) {
    if (this.hasDBG) {
      this.totalBuffs += 2;
    } else {
      this.totalBuffs += 1;
    }
  }

  BuffStacksRemoved(event: RemoveBuffStackEvent) {
    // if you have the same number of buff removals as buff stack removals, this will be 0, meaning you wasted 0 buffs
    this.goodRemovals += 1;
  }

  get missedChargesSuggestion() {
    return {
      actual: this.totalBuffs - this.goodRemovals,
      isGreaterThan: {
        minor: 1,
        average: 2,
        major: 3,
      },
      style: ThresholdStyle.NUMBER,
    };
  }
  suggestions(when: When) {
    // (should) only ever display the notEnoughCastsSuggestion or the unbuffedCastsSuggestion, never both
    when(this.missedChargesSuggestion).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to avoid wasting the <SpellLink id={SPELLS.VANQUISHERS_HAMMER.id} /> buff, as this is
          a large waste of healing.
        </>,
      )
        .icon(SPELLS.VANQUISHERS_HAMMER.icon)
        .actual(<>You wasted {actual} buffs</>)
        .recommended(`It is recommended to never waste the buff.`),
    );
  }
}
export default VanquishersHammerAnalysis;
