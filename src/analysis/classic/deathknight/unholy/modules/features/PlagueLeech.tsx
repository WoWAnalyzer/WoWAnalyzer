import SPELLS from 'common/SPELLS/classic/deathknight';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

/**
 * Tracks Plague Leech usage for Unholy DK.
 *
 * Same 25s CD mechanic as Frost — nets 2 free Death runes per use when both
 * diseases are active. Priority order for activated runes: Frost → Blood →
 * Unholy, so Unholy runes are left to regen naturally for Scourge Strike.
 *
 * Cast/cooldown accounting (casts, max possible casts, efficiency) is handled
 * by the core CastEfficiency module via the spell's `cooldown` entry in
 * Abilities.ts — no need to recompute it here.
 */
class PlagueLeech extends Analyzer {
  static dependencies = {
    castEfficiency: CastEfficiency,
  };
  protected castEfficiency!: CastEfficiency;

  private get _info() {
    return this.castEfficiency.getCastEfficiencyForSpell(SPELLS.PLAGUE_LEECH);
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
        position={STATISTIC_ORDER.OPTIONAL(40)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={`${info.casts} of ${Math.ceil(info.maxCasts)} possible Plague Leech casts.`}
      >
        <BoringSpellValueText spell={SPELLS.PLAGUE_LEECH}>
          {info.casts} <small>/ {Math.ceil(info.maxCasts)} possible</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PlagueLeech;
