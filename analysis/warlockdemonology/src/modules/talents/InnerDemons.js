import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';

import DemoPets from '../pets/DemoPets';
import { isRandomPet } from '../pets/helpers';
import PETS from '../pets/PETS';

class InnerDemons extends Analyzer {
  get damage() {
    const wildImps = this.demoPets.getPetDamage(PETS.WILD_IMP_INNER_DEMONS.guid);
    const otherPetsSummonedByID = this.demoPets.timeline.filter(
      (pet) => isRandomPet(pet.guid) && pet.summonedBy === SPELLS.INNER_DEMONS_TALENT.id,
    );
    const other = otherPetsSummonedByID
      .map((pet) => this.demoPets.getPetDamage(pet.guid, pet.instance))
      .reduce((total, current) => total + current, 0);
    return wildImps + other;
  }

  static dependencies = {
    demoPets: DemoPets,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.INNER_DEMONS_TALENT.id);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            {formatThousands(this.damage)} damage
            <br />
            Note that this only counts the direct damage from them, not Implosion damage (if used)
            from Wild Imps
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.INNER_DEMONS_TALENT.id}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default InnerDemons;
