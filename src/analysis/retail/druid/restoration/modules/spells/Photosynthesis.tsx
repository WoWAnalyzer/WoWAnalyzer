import { formatOverhealing } from 'analysis/retail/druid/restoration/format';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import {
  isFromExpiringLifebloom,
  isFromEverbloom,
} from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import Everbloom from 'analysis/retail/druid/restoration/modules/spells/Everbloom';
import Verdancy from 'analysis/retail/druid/restoration/modules/spells/Verdancy';
import { TALENTS_DRUID } from 'common/TALENTS';

/**
 * **Photosynthesis**
 * Spec Talent Tier 10
 *
 * Your periodic heals on targets with Lifebloom have a 8% chance to cause it to bloom.
 */
class Photosynthesis extends Analyzer {
  static dependencies = {
    everbloom: Everbloom,
    verdancy: Verdancy,
  };

  protected everbloom!: Everbloom;
  protected verdancy!: Verdancy;

  /** Total healing from randomly procced blooms */
  extraBloomHealing = 0;
  /** Total overhealing from randomly procced blooms */
  extraBloomOverhealing = 0;
  /** Number of random blooms */
  randomProcs = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.PHOTOSYNTHESIS_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIFEBLOOM_BLOOM_HEAL),
      this.onLifebloomProc,
    );
  }

  onLifebloomProc(event: HealEvent) {
    if (!isFromExpiringLifebloom(event) && !isFromEverbloom(event)) {
      this.randomProcs += 1;
      this.extraBloomHealing += event.amount + (event.absorbed || 0);
      this.extraBloomOverhealing += event.overheal || 0;
    }
  }

  get verdancyHealing(): number {
    return this.verdancy.active ? this.verdancy.photoBloomHealing : 0;
  }

  get verdancyOverhealing(): number {
    return this.verdancy.active ? this.verdancy.photoBloomOverhealing : 0;
  }

  get everbloomSplashHealing(): number {
    return this.everbloom.active ? this.everbloom.photosynthesisSplashHealing : 0;
  }

  get everbloomSplashOverhealing(): number {
    return this.everbloom.active ? this.everbloom.photosynthesisSplashOverhealing : 0;
  }

  get totalHealing(): number {
    return this.extraBloomHealing + this.verdancyHealing + this.everbloomSplashHealing;
  }

  get totalOverhealing(): number {
    return this.extraBloomOverhealing + this.verdancyOverhealing + this.everbloomSplashOverhealing;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(10)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            <strong>Photosynthesis healing breakdown</strong>
            <ul>
              <li>
                Extra bloom healing: <strong>{formatNumber(this.extraBloomHealing)}</strong>
              </li>
              {this.everbloomSplashHealing > 0 && (
                <li>
                  Everbloom splash healing from Photosynthesis blooms:{' '}
                  <strong>{formatNumber(this.everbloomSplashHealing)}</strong>
                </li>
              )}
              {this.verdancyHealing > 0 && (
                <li>
                  Verdancy healing from Photosynthesis blooms:{' '}
                  <strong>{formatNumber(this.verdancyHealing)}</strong>
                </li>
              )}
            </ul>
            <strong>
              Overhealing: {formatOverhealing(this.totalOverhealing, this.totalHealing)}
            </strong>
            <p>
              <em>
                <strong>{this.randomProcs}</strong> extra blooms
              </em>
            </p>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.PHOTOSYNTHESIS_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Photosynthesis;
