import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import STATISTIC_CATEGORY from 'Interface/Others/STATISTIC_CATEGORY';
import SpellIcon from 'common/SpellIcon';
import React from 'react';
import SpiritOfRedemption from 'Parser/Priest/Holy/Modules/Spells/SpiritOfRedemption';
import ItemManaGained from 'Interface/Others/ItemManaGained';

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

      <TraitStatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.ENLIGHTENMENT_TALENT.id} />}
        value={(
          <React.Fragment>
            <ItemManaGained amount={this.enlightenmentMana} />
          </React.Fragment>
        )}
        label="Enlightment"
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default Enlightenment;
