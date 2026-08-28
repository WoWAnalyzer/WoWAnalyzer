import Analyzer, { Options } from 'parser/core/Analyzer';
import { HealEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';

/**
 * Shared SymBloom queries for hero-tree nesting.
 * Amp modules skip SymBloom ticks so they are not also counted as HoT amps.
 */
export default class SymbioticBloomDirectClaim extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active = true;
  }

  /**
   * Fraction of this heal already counted as direct SymBloom healing in the hero tree (0–1).
   * SymBloom ticks are fully claimed. Other heals: 0.
   */
  getDirectClaimPortion(event: HealEvent): number {
    if (event.ability.guid !== SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER.id) {
      return 0;
    }
    return 1;
  }
}
