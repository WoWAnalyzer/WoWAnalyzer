import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox, { STATISTIC_ORDER } from 'interface/others/TalentStatisticBox';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import SpellIcon from 'common/SpellIcon';
import React from 'react';
import SpiritOfRedemption from 'parser/priest/holy/modules/spells/SpiritOfRedemption';
import ItemManaGained from 'interface/others/ItemManaGained';

const MAX_MANA = 100000;
const BASE_MANA_REGEN = .04;

// Example Log: /report/PNYB4zgrnR86h7Lc/6-Normal+Zek'voz,+Herald+of+N'zoth/Khadaj
class Enlightenment extends Analyzer {

  static dependencies = {
    spiritOfRedemption: SpiritOfRedemption,
  };

  constructor(...args) {
    super(...args);
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

      <TalentStatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.ENLIGHTENMENT_TALENT.id} />}
        value={(
          <ItemManaGained amount={this.enlightenmentMana} />
        )}
        label="Enlightment"
        position={STATISTIC_ORDER.CORE(1)}
      />

    );
  }
}

export default Enlightenment;
