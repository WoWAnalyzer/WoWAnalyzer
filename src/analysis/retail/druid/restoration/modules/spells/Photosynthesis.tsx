import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { isFromExpiringLifebloom } from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import Lifebloom from 'analysis/retail/druid/restoration/modules/spells/Lifebloom';
import { TALENTS_DRUID } from 'common/TALENTS';

/**
 * **Photosynthesis**
 * Spec Talent Tier 10
 *
 * Your periodic heals on targets with Lifebloom have a 8% chance to cause it to bloom.
 */
class Photosynthesis extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    lifebloom: Lifebloom,
  };

  protected combatants!: Combatants;
  protected lifebloom!: Lifebloom;

  /** Total healing from randomly procced blooms */
  extraBloomHealing = 0;
  /** Number of random blooms */
  randomProccs = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.PHOTOSYNTHESIS_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIFEBLOOM_BLOOM_HEAL),
      this.onLifebloomProc,
    );
  }

  // TODO: update this once SotF has a cast link setup
  onLifebloomProc(event: HealEvent) {
    if (!isFromExpiringLifebloom(event)) {
      this.randomProccs += 1;
      this.extraBloomHealing += event.amount + (event.absorbed || 0);
    }
  }

  get totalHealing(): number {
    return this.extraBloomHealing;
  }

  get percentHealing(): number {
    return this.owner.getPercentageOfTotalHealingDone(this.totalHealing);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(10)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            <li>
              <strong>{this.randomProccs}</strong> extra blooms
            </li>
            <li>
              <strong>
                {formatPercentage(
                  this.owner.getPercentageOfTotalHealingDone(this.extraBloomHealing),
                )}
                %
              </strong>{' '}
              total healing from extra blooms
            </li>
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
