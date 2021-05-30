import Analyzer, { Options } from 'parser/core/Analyzer';
import HotAttributor from '../../core/hottracking/HotAttributor';
import SPELLS from 'common/SPELLS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import React from 'react';

// TODO refactor to be usable by all specs?
/**
 * **Lycara's Fleeting Glimpse**
 * Runecarving Legendary
 *
 * Every 45 sec while in combat, cast a spell based on your form:
 * No Form: Wild Growth
 * Cat Form: Primal Wrath
 * Bear Form: Barkskin
 * Moonkin Form: Starfall
 * Travel Form: Stampeding Roar
 */
class LycarasFleetingGlimpseResto extends Analyzer {
  static dependencies = {
    hotAttributor: HotAttributor,
  };

  hotAttributor!: HotAttributor;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(
      SPELLS.LYCARAS_FLEETING_GLIMPSE.bonusID,
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            This is the healing attributable to the wild growths spawned by the Lycara's Fleeting
            Glimpse legendary. This amount includes the mastery benefit. Spell casts from being in
            other forms are not considered here.
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.LYCARAS_FLEETING_GLIMPSE}>
          <ItemPercentHealingDone
            amount={this.hotAttributor.lycarasFleetingGlimpseAttrib.healing}
          />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default LycarasFleetingGlimpseResto;
