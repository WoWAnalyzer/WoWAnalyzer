import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { TALENTS_DRUID } from 'common/TALENTS';
import Mastery from 'analysis/retail/druid/restoration/modules/core/Mastery';

/**
 * **Spring Blossoms**
 * Spec Talent Tier 8
 *
 * Each target healed by Efflorescence is healed for an additional (X% of Spell power) over 6 sec.
 */
class SpringBlossoms extends Analyzer {
  static dependencies = {
    mastery: Mastery,
  };

  protected mastery!: Mastery;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.SPRING_BLOSSOMS_TALENT);
  }

  get directHealing() {
    return this.mastery.getDirectHealing(SPELLS.SPRING_BLOSSOMS.id);
  }

  get masteryHealing() {
    return this.mastery.getMasteryHealing(SPELLS.SPRING_BLOSSOMS.id);
  }

  get totalHealing() {
    return this.directHealing + this.masteryHealing;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(8)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This is the sum of the direct healing from Spring Blossoms and the healing enabled by
            Spring Blossom's extra mastery stack.
            <ul>
              <li>
                Direct: <strong>{this.owner.formatItemHealingDone(this.directHealing)}</strong>
              </li>
              <li>
                Mastery: <strong>{this.owner.formatItemHealingDone(this.masteryHealing)}</strong>
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.SPRING_BLOSSOMS_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SpringBlossoms;
