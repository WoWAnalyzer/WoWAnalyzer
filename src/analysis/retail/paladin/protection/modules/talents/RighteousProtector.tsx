import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/paladin';
import { SpellIcon } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import type { ReactNode } from 'react';

// Kept for compatibility with LightOfTheProtector.jsx (unused)
export const REDUCTION_TIME = 1500;

const COOLDOWN_WITHOUT_TALENT = 120;
const COOLDOWN_WITH_TALENT = 60;

export default class RighteousProtector extends Analyzer.withDependencies({
  castEfficiency: CastEfficiency,
}) {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.RIGHTEOUS_PROTECTOR_TALENT);
  }

  get totalReductionSeconds(): number {
    const targetSpell = this.selectedCombatant.hasTalent(TALENTS.SENTINEL_TALENT)
      ? TALENTS.SENTINEL_TALENT
      : TALENTS.AVENGING_WRATH_TALENT;
    const ce = this.deps.castEfficiency.getCastEfficiencyForSpell(targetSpell);
    const casts = ce ? ce.casts : 0;
    return casts * (COOLDOWN_WITHOUT_TALENT - COOLDOWN_WITH_TALENT);
  }

  statistic(): ReactNode {
    if (!this.active) {
      return null;
    }

    const targetSpell = this.selectedCombatant.hasTalent(TALENTS.SENTINEL_TALENT)
      ? TALENTS.SENTINEL_TALENT
      : TALENTS.AVENGING_WRATH_TALENT;

    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Cooldown reduced from {COOLDOWN_WITHOUT_TALENT}s to {COOLDOWN_WITH_TALENT}s (-50%).
            <br />
            Duration reduced by 40% (affected by Sanctified Wrath).
            <br />
            Total cooldown reduction: {formatNumber(this.totalReductionSeconds)}s.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.RIGHTEOUS_PROTECTOR_TALENT}>
          <SpellIcon spell={targetSpell} /> {formatNumber(this.totalReductionSeconds)}s CD Reduction
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
