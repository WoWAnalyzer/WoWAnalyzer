import Renew from 'analysis/retail/priest/holy/modules/spells/Renew';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

// Example Log: /report/PNYB4zgrnR86h7Lc/6-Normal+Zek'voz,+Herald+of+N'zoth/Khadaj
class Benediction extends Analyzer {
  static dependencies = {
    renew: Renew,
  };
  protected renew!: Renew;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BENEDICTION_TALENT);
  }

  get renewsFromBenediction() {
    return this.renew.renewsFromBenediction;
  }

  get healingFromBenedictionRenews() {
    return this.renew.healingFromRenew(this.renewsFromBenediction);
  }

  get overhealingFromBenedictionRenews() {
    return this.renew.overhealingFromRenew(this.renewsFromBenediction);
  }

  get absorbedHealingFromBenedictionRenews() {
    return this.renew.absorptionFromRenew(this.renewsFromBenediction);
  }

  statistic() {
    return (
      <Statistic
        tooltip={`${this.renewsFromBenediction} total Renews from Benediction`}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(6)}
      >
        <BoringSpellValueText spellId={TALENTS.BENEDICTION_TALENT.id}>
          <ItemHealingDone amount={this.healingFromBenedictionRenews} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Benediction;
