import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SPELLS from 'common/SPELLS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Events, { HealEvent } from 'parser/core/Events';
import { isFromExpiringLifebloom } from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import { SpellLink } from 'interface';

/**
 * **Verdancy**
 * Spec Talent
 *
 * When Lifebloom blooms, up to 3 targets within your Efflorescence are healed for X.
 */
class Verdancy extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;

  naturalBlooms = 0;
  photoBlooms = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.VERDANCY_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIFEBLOOM_BLOOM_HEAL),
      this.onBloom,
    );
  }

  onBloom(event: HealEvent) {
    if (isFromExpiringLifebloom(event)) {
      this.naturalBlooms += 1;
    } else {
      this.photoBlooms += 1;
    }
  }

  get averageVerdancyHitsPerBloom() {
    const blooms = this.abilityTracker.getAbility(SPELLS.LIFEBLOOM_BLOOM_HEAL.id).healingHits;
    const verdancyHits = this.abilityTracker.getAbility(SPELLS.VERDANCY.id).healingHits;
    return blooms === 0 ? 0 : verdancyHits / blooms;
  }

  statistic() {
    const hasPhotosynthesis = this.selectedCombatant.hasTalent(TALENTS_DRUID.PHOTOSYNTHESIS_TALENT);
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(7)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            In order to maximize Verdancy healing, you need to consistently proc blooms and
            consistently keep efflo under raiders.
            <ul>
              <li>
                Avg. hits per Bloom: <strong>{this.averageVerdancyHitsPerBloom.toFixed(1)}</strong>
              </li>
              {hasPhotosynthesis ? (
                <>
                  <li>
                    Natural Blooms:{' '}
                    <strong>{this.owner.getPerMinute(this.naturalBlooms).toFixed(1)}</strong> per
                    minute
                  </li>
                  <li>
                    <SpellLink spell={TALENTS_DRUID.PHOTOSYNTHESIS_TALENT} /> Blooms:{' '}
                    <strong>{this.owner.getPerMinute(this.photoBlooms).toFixed(1)}</strong> per
                    minute
                  </li>
                </>
              ) : (
                <>
                  <li>
                    Blooms per minute:{' '}
                    <strong>
                      {this.owner.getPerMinute(this.naturalBlooms + this.photoBlooms)}
                    </strong>
                  </li>
                </>
              )}
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.VERDANCY_TALENT}>
          <ItemPercentHealingDone
            amount={this.abilityTracker.getAbilityHealing(SPELLS.VERDANCY.id)}
          />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Verdancy;
