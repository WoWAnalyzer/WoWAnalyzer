import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import Mastery from '../../core/Mastery';

/**
 * Resto Druid Tier 28 - 2pc - Renewing Bloom
 * Healing from Rejuvenation has a 25% chance to grant Renewing Bloom, healing (20.8% of Spell power) over 8 sec.
 * Swiftmend can consume Renewing Bloom. (Proc chance: 25%)
 */
class Tier28_2pc extends Analyzer {
  static dependencies = {
    mastery: Mastery,
  };

  protected mastery!: Mastery;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.has2Piece();
    this.addEventListener(Events.fightend, this.checkActive);
  }

  checkActive() {
    this.active = this.totalHealing !== 0;
  }

  get directHealing() {
    return this.mastery.getDirectHealing(SPELLS.RENEWING_BLOOM.id.toString());
  }

  get masteryHealing() {
    return this.mastery.getMasteryHealing(SPELLS.RENEWING_BLOOM.id.toString());
  }

  get totalHealing() {
    return this.directHealing + this.masteryHealing;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(40)}
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={
          <>
            Renewing Bloom is the HoT procced by the <strong>Tier 28 2-piece set bonus</strong>. The
            healing amount is the sum of the direct healing from Renewing Bloom and the healing
            enabled by Renewing Bloom's extra mastery stack.
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
        <BoringSpellValueText spellId={SPELLS.RESTO_DRUID_TIER_28_2P_SET_BONUS.id}>
          <ItemPercentHealingDone amount={this.totalHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Tier28_2pc;
