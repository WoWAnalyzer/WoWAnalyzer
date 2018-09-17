import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import STATISTIC_CATEGORY from 'Interface/Others/STATISTIC_CATEGORY';
import SpellIcon from 'common/SpellIcon';
import React from 'react';
import ItemHealingDone from 'Interface/Others/ItemHealingDone';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';

class Halo extends Analyzer {
  haloDamage = 0;
  haloHealing = 0;
  haloOverhealing = 0;
  haloCasts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.HALO_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.HALO_TALENT.id) {
      this.haloDamage += event.amount || 0;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.HALO_TALENT.id) {
      this.haloHealing += event.amount || 0;
      this.haloOverhealing += event.overhealing || 0;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.HALO_TALENT.id) {
      this.haloCasts++;
    }
  }

  statistic() {
    return (

      <TraitStatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.HALO_TALENT.id} />}
        value={(
          <React.Fragment>
            <ItemHealingDone amount={this.haloHealing} /><br />
            <ItemDamageDone amount={this.haloDamage} />
          </React.Fragment>
        )}
        label="Halo"
        tooltip={``}
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(6);
}

export default Halo;
