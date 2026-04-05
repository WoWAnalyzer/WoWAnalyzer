import { formatNumber } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Events, { HealEvent } from 'parser/core/Events';
import {
  getSourceBloom,
  isFromEverbloom,
  isFromExpiringLifebloom,
} from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';

/**
 * **Verdancy**
 * Spec Talent Tier 6
 *
 * When Lifebloom blooms, up to 3 targets within your Efflorescence are healed for X.
 */
class Verdancy extends Analyzer {
  /** Verdancy healing from normal Lifebloom blooms (expiry/refresh) */
  normalBloomHealing = 0;
  /** Verdancy healing from Photosynthesis-triggered blooms */
  photoBloomHealing = 0;
  /** Verdancy healing from Everbloom Blooming Frenzy blooms */
  everbloomBloomHealing = 0;

  private hasPhotosynthesis = false;
  private hasEverbloomRank3 = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.VERDANCY_TALENT);

    this.hasPhotosynthesis = this.selectedCombatant.hasTalent(TALENTS_DRUID.PHOTOSYNTHESIS_TALENT);
    this.hasEverbloomRank3 = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.EVERBLOOM_3_RESTORATION_TALENT,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.VERDANCY),
      this.onVerdancyHeal,
    );
  }

  private onVerdancyHeal = (event: HealEvent) => {
    const effectiveHealing = event.amount + (event.absorbed || 0);
    const sourceBloom = getSourceBloom(event);

    if (sourceBloom && isFromEverbloom(sourceBloom)) {
      this.everbloomBloomHealing += effectiveHealing;
    } else if (sourceBloom && isFromExpiringLifebloom(sourceBloom)) {
      this.normalBloomHealing += effectiveHealing;
    } else {
      // Photosynthesis or unlinked blooms
      this.photoBloomHealing += effectiveHealing;
    }
  };

  get totalVerdancyHealing() {
    return this.normalBloomHealing + this.photoBloomHealing + this.everbloomBloomHealing;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(6)}
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <strong>Verdancy healing breakdown</strong>
            <ul>
              <li>
                From normal blooms: <strong>{formatNumber(this.normalBloomHealing)}</strong>
              </li>
              {this.hasPhotosynthesis && (
                <li>
                  From Photosynthesis blooms:{' '}
                  <strong>{formatNumber(this.photoBloomHealing)}</strong>
                </li>
              )}
              {this.hasEverbloomRank3 && (
                <li>
                  From Blooming Frenzy blooms:{' '}
                  <strong>{formatNumber(this.everbloomBloomHealing)}</strong>
                </li>
              )}
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.VERDANCY_TALENT}>
          <ItemPercentHealingDone amount={this.totalVerdancyHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Verdancy;
