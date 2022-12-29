import { formatThousands } from 'common/format';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import DemoPets from '../pets/DemoPets';

class NetherPortal extends Analyzer {
  get damage() {
    const petsSummonedByNP = this.demoPets.timeline.filter(
      (pet) => pet.summonedBy === TALENTS.NETHER_PORTAL_TALENT.id,
    );
    return petsSummonedByNP
      .map((pet) => this.demoPets.getPetDamage(pet.guid, pet.instance))
      .reduce((total, current) => total + current, 0);
  }

  static dependencies = {
    demoPets: DemoPets,
  };
  demoPets!: DemoPets;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.NETHER_PORTAL_TALENT);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`${formatThousands(this.damage)} damage`}
      >
        <BoringSpellValueText spellId={TALENTS.NETHER_PORTAL_TALENT.id}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default NetherPortal;
