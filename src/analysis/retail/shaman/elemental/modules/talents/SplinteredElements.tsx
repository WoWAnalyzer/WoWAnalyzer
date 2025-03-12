import BaseSplinteredElements from 'analysis/retail/shaman/shared/talents/SplinteredElements';
import TALENTS from 'common/TALENTS/shaman';

const SPLINTERED_ELEMENTS_HASTE = {
  base: 10,
  perHit: 4,
};

export default class SplinteredElements extends BaseSplinteredElements {
  isActive(): boolean {
    return this.selectedCombatant.hasTalent(TALENTS.SPLINTERED_ELEMENTS_TALENT);
  }

  getGainedHaste(hitCount: number): number {
    return (SPLINTERED_ELEMENTS_HASTE.base + SPLINTERED_ELEMENTS_HASTE.perHit * hitCount) / 100;
  }
}
