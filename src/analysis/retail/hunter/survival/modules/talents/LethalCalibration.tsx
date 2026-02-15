import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, GetRelatedEvents } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { LETHAL_CALIBRATION_CDR_PER_HIT, LETHAL_CALIBRATION_MAX_TARGETS } from '../../constants';
import { WILDFIRE_BOMB_CAST_IMPACT } from '../../normalizers/WildfireBombNormalizer';

/**
 * Lethal Calibration
 *
 * Wildfire Bomb initial impact damage reduces Boomstick's cooldown by 2s per target hit,
 * up to 10s (5 targets max) per cast.
 */
class LethalCalibration extends Analyzer.withDependencies({ spellUsable: SpellUsable }) {
  private effectiveCDR = 0;
  private wastedCDR = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.LETHAL_CALIBRATION_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.WILDFIRE_BOMB_TALENT),
      this.onWildfireBombCast,
    );
  }

  private onWildfireBombCast = (event: CastEvent) => {
    const impactHits = GetRelatedEvents<DamageEvent>(event, WILDFIRE_BOMB_CAST_IMPACT);

    const hitsToProcess = Math.min(impactHits.length, LETHAL_CALIBRATION_MAX_TARGETS);

    // Apply CDR for each unique target hit (up to max)
    for (let i = 0; i < hitsToProcess; i++) {
      const effective = this.deps.spellUsable.reduceCooldown(
        TALENTS.BOOMSTICK_TALENT.id,
        LETHAL_CALIBRATION_CDR_PER_HIT,
      );
      this.effectiveCDR += effective;
      this.wastedCDR += LETHAL_CALIBRATION_CDR_PER_HIT - effective;
    }
  };

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Lethal Calibration reduced Boomstick's cooldown by{' '}
            <strong>{(this.effectiveCDR / 1000).toFixed(1)}s</strong> total.
            <br />
            <strong>{(this.wastedCDR / 1000).toFixed(1)}s</strong> was wasted (Boomstick not on
            cooldown).
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.LETHAL_CALIBRATION_TALENT}>
          <>
            {(this.effectiveCDR / 1000).toFixed(1)}s <small>CDR gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default LethalCalibration;
