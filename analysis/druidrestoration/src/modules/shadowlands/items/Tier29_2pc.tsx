import Analyzer from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import SPELLS from 'common/SPELLS';
import Mastery from '../../core/Mastery';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import React from 'react';
import Events from 'parser/core/Events';

/**
 * Resto Druid Tier 29 - 2pc - Renewing Bloom
 * Healing from Rejuvenation has a 25% chance to grant Renewing Bloom, healing (20.8% of Spell power) over 8 sec.
 * Swiftmend can consume Renewing Bloom. (Proc chance: 25%)
 */
class Tier29_2pc extends Analyzer {
  static dependencies = {
    mastery: Mastery,
  };

  protected mastery!: Mastery;

  constructor(options: Options) {
    super(options);

    // FIXME so far on PTR, no bonus ID shows if player has set or not
    //       We'll instead check at fight end if any healing from it was detected.
    //       Update this later if a bonusID gets added
    this.addEventListener(Events.fightend, this.checkActive);
  }

  checkActive() {
    this.active = this.totalHealing !== 0;
  }

  get directHealing() {
    return this.mastery.getDirectHealing(SPELLS.RENEWING_BLOOM.id);
  }

  get masteryHealing() {
    return this.mastery.getMasteryHealing(SPELLS.RENEWING_BLOOM.id);
  }

  get totalHealing() {
    return this.directHealing + this.masteryHealing;
  }

  // TODO improve the wording?
  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(40)}
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={
          <>
            Renewing Bloom is the HoT procced by the Tier 29 2 pc bonus. The healing amount is the sum
            of the direct healing from Renewing Bloom and the healing enabled by Renewing Bloom's extra mastery stack.
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
        <BoringSpellValueText spellId={SPELLS.RENEWING_BLOOM.id}>
          <ItemPercentHealingDone amount={this.totalHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default Tier29_2pc;
