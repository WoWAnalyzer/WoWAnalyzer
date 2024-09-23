import SpiritOfRedemption from 'analysis/retail/priest/holy/modules/spells/SpiritOfRedemption';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import {
  ENLIGHT_BASE_MANA_REGEN,
  ENLIGHT_MAX_MANA,
  ENLIGHT_SCALED_MANA_REGEN,
} from '../../../constants';

// Example Log: /report/PNYB4zgrnR86h7Lc/6-Normal+Zek'voz,+Herald+of+N'zoth/Khadaj
class Enlightenment extends Analyzer {
  static dependencies = {
    spiritOfRedemption: SpiritOfRedemption,
  };
  protected spiritOfRedemption!: SpiritOfRedemption;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ENLIGHTENMENT_TALENT);
  }

  get enlightenmentMana() {
    const normalManaRegen = ENLIGHT_MAX_MANA * ENLIGHT_BASE_MANA_REGEN;
    const enlightenmentRegen = normalManaRegen * ENLIGHT_SCALED_MANA_REGEN;
    // Convert from MS to S and from 1 second to 5.
    const totalEnlightenmentManaBack =
      (this.spiritOfRedemption.aliveTime / 1000 / 5) * enlightenmentRegen;
    return totalEnlightenmentManaBack;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(1)}
      >
        <BoringSpellValueText spell={TALENTS.ENLIGHTENMENT_TALENT}>
          <ItemManaGained amount={this.enlightenmentMana} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Enlightenment;
