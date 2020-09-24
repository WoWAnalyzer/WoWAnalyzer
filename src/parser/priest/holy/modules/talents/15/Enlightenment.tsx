import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import React from 'react';
import SpiritOfRedemption from 'parser/priest/holy/modules/spells/SpiritOfRedemption';
import ItemManaGained from 'interface/ItemManaGained';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

const MAX_MANA = 100000;
const BASE_MANA_REGEN = .04;

// Example Log: /report/PNYB4zgrnR86h7Lc/6-Normal+Zek'voz,+Herald+of+N'zoth/Khadaj
class Enlightenment extends Analyzer {

  static dependencies = {
    spiritOfRedemption: SpiritOfRedemption,
  };
  protected spiritOfRedemption!: SpiritOfRedemption;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ENLIGHTENMENT_TALENT.id);
  }

  get enlightenmentMana() {
    const normalManaRegen = MAX_MANA * BASE_MANA_REGEN;
    const enlightenmentRegen = normalManaRegen * .1;
    // Convert from MS to S and from 1 second to 5.
    const totalEnlightenmentManaBack = (this.spiritOfRedemption.aliveTime / 1000 / 5) * enlightenmentRegen;
    return totalEnlightenmentManaBack;
  }

  statistic() {
    return (
      <Statistic
        talent={SPELLS.ENLIGHTENMENT_TALENT.id}
        value={(
          <ItemManaGained amount={this.enlightenmentMana} />
        )}
        category={STATISTIC_CATEGORY.TALENTS}
      />

    );
  }
}

export default Enlightenment;
