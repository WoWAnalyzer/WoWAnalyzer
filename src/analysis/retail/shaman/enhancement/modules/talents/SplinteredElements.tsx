import BaseSplinteredElements from 'analysis/retail/shaman/shared/talents/SplinteredElements';
import TALENTS from 'common/TALENTS/shaman';
import { Options } from 'parser/core/Analyzer';

interface HastePerRank {
  base: number;
  perHit: number;
}

const HASTE: Record<number, HastePerRank> = {
  1: {
    base: 5,
    perHit: 2,
  },
  2: {
    base: 10,
    perHit: 4,
  },
};

export default class SplinteredElements extends BaseSplinteredElements {
  protected rank: number;

  constructor(options: Options) {
    super(options);

    this.rank = this.selectedCombatant.getTalentRank(TALENTS.SPLINTERED_ELEMENTS_TALENT);
  }

  isActive(): boolean {
    return this.rank >= this.selectedCombatant.getTalentRank(TALENTS.SPLINTERED_ELEMENTS_TALENT);
  }

  getGainedHaste(hitCount: number): number {
    return (HASTE[this.rank].base + HASTE[this.rank].perHit * hitCount) / 100;
  }
}
