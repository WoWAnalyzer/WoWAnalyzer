import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import HotAttributor from '../../core/hottracking/HotAttributor';

/**
 * **Vision of Unending Growth**
 * Runecarving Legendary
 *
 * Rejuvenation healing has a 2.5% chance to create a new Rejuvenation on a nearby target.
 */
class VisionOfUnendingGrowth extends Analyzer {
  static dependencies = {
    hotAttributor: HotAttributor,
  };

  hotAttributor!: HotAttributor;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(
      SPELLS.VISION_OF_UNENDING_GROWTH.bonusID,
    );
  }

  get procs() {
    return this.hotAttributor.visionOfUnendingGrowthAttrib.procs;
  }

  get procsPerMinute() {
    return this.procs / (this.owner.fightDuration / 60 / 1000);
  }

  get healing() {
    return this.hotAttributor.visionOfUnendingGrowthAttrib.healing;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            This is the healing attributable to rejuvenations spawned by the Vision of Unending
            Growth legendary. This amount includes the mastery benefit.
            <ul>
              <li>
                Total Procs: <strong>{this.procs}</strong>
              </li>
              <li>
                Procs per Minute: <strong>{this.procsPerMinute.toFixed(1)}</strong>
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.VISION_OF_UNENDING_GROWTH.id}>
          <ItemPercentHealingDone amount={this.healing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default VisionOfUnendingGrowth;
