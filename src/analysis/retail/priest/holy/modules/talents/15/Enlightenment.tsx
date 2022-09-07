import SpiritOfRedemption from 'analysis/retail/priest/holy/modules/spells/SpiritOfRedemption';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const MAX_MANA = 50000;
const BASE_MANA_REGEN = 0.04;

// Example Log: /report/PNYB4zgrnR86h7Lc/6-Normal+Zek'voz,+Herald+of+N'zoth/Khadaj
class Enlightenment extends Analyzer {
  static dependencies = {
    spiritOfRedemption: SpiritOfRedemption,
  };
  protected spiritOfRedemption!: SpiritOfRedemption;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ENLIGHTENMENT_TALENT.id);
  }

  get enlightenmentMana() {
    const normalManaRegen = MAX_MANA * BASE_MANA_REGEN;
    const enlightenmentRegen = normalManaRegen * 0.1;
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
        <BoringSpellValueText spellId={SPELLS.ENLIGHTENMENT_TALENT.id}>
          <ItemManaGained amount={this.enlightenmentMana} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Enlightenment;
