import { formatThousands } from 'common/format';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import DemoPets from '../pets/DemoPets';
import PETS from '../pets/PETS';

class SummonVilefiend extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };

  demoPets!: DemoPets;
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SUMMON_VILEFIEND_TALENT);
  }

  getCurrentPetGUID() {
    return this.selectedCombatant.hasTalent(TALENTS.MARK_OF_FHARG_TALENT)
      ? PETS.CHARHOUND.guid
      : this.selectedCombatant.hasTalent(TALENTS.MARK_OF_SHATUG_TALENT)
        ? PETS.GLOOMHOUND.guid
        : PETS.VILEFIEND.guid;
  }

  getCurrentTalentUsed() {
    return this.selectedCombatant.hasTalent(TALENTS.MARK_OF_FHARG_TALENT)
      ? TALENTS.MARK_OF_FHARG_TALENT
      : this.selectedCombatant.hasTalent(TALENTS.MARK_OF_SHATUG_TALENT)
        ? TALENTS.MARK_OF_SHATUG_TALENT
        : TALENTS.SUMMON_VILEFIEND_TALENT;
  }

  statistic() {
    const damage = this.demoPets.getPetDamage(this.getCurrentPetGUID());
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`${formatThousands(damage)} damage`}
      >
        <BoringSpellValueText spell={this.getCurrentTalentUsed()}>
          <ItemDamageDone amount={damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SummonVilefiend;
