import Renew from 'analysis/retail/priest/holy/modules/spells/Renew';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

// Example Log: /report/w9BXrzFApPbj6LnG/14-Mythic+Dathea,+Ascended+-+Wipe+13+(3:14)/Benchmepls/standard/statistics
class RevitalizingPrayers extends Analyzer {
  static dependencies = {
    renew: Renew,
  };
  protected renew!: Renew;

  constructor(options: Options) {
    super(options);
    if (!this.selectedCombatant.hasTalent(TALENTS.REVITALIZING_PRAYERS_TALENT.id)) {
      this.active = false;
      return;
    }
  }

  get renewsFromRevitalizingPrayers() {
    return this.renew.revitalizingPrayersRenewDurations;
  }

  get healingFromRevitalizingPrayersRenews() {
    return this.renew.healingFromRenew(this.renewsFromRevitalizingPrayers);
  }

  get overhealingFromRevitalizingPrayersRenews() {
    return this.renew.overhealingFromRenew(this.renewsFromRevitalizingPrayers);
  }

  get absorbedHealingFromRevitalizingPrayersRenews() {
    return this.renew.absorptionFromRenew(this.renewsFromRevitalizingPrayers);
  }

  statistic() {
    return (
      <Statistic
        tooltip={`${this.renewsFromRevitalizingPrayers.toFixed(
          1,
        )} total Renews from Revitalizing Prayers`}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(6)}
      >
        <BoringSpellValueText spellId={TALENTS.REVITALIZING_PRAYERS_TALENT.id}>
          <ItemHealingDone amount={this.healingFromRevitalizingPrayersRenews} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RevitalizingPrayers;
