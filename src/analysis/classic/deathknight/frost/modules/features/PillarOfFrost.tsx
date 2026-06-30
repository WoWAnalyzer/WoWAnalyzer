import SPELLS from 'common/SPELLS/classic/deathknight';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

/**
 * Tracks Pillar of Frost usage vs. possible uses.
 *
 * Pillar of Frost has a 60s cooldown. Maximising PoF uptime is one of the
 * highest-value Frost DK optimisations since it lines up with every major
 * cooldown window.
 *
 * Cast/cooldown accounting (casts, max possible casts, efficiency) is handled
 * by the core CastEfficiency module via the spell's `cooldown` entry in
 * Abilities.ts, including pre-pull casts (Buffs.tsx marks Pillar of Frost
 * with `triggeredBySpellId` so PrePullCooldowns can detect a pre-pull cast) —
 * no need to recompute it here.
 */
class PillarOfFrost extends Analyzer {
  static dependencies = {
    castEfficiency: CastEfficiency,
  };
  protected castEfficiency!: CastEfficiency;

  private get _info() {
    return this.castEfficiency.getCastEfficiencyForSpell(SPELLS.PILLAR_OF_FROST);
  }

  get suggestionThresholds() {
    return {
      actual: this._info?.efficiency ?? 1,
      isLessThan: { minor: 1.0, average: 0.85, major: 0.7 },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    const info = this._info;
    if (!info) {
      return null;
    }
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(30)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={`${info.casts} of ${Math.ceil(info.maxCasts)} possible Pillar of Frost casts.`}
      >
        <BoringSpellValueText spell={SPELLS.PILLAR_OF_FROST}>
          {info.casts} <small>/ {Math.ceil(info.maxCasts)} possible</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PillarOfFrost;
