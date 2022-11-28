import Renew from 'analysis/retail/priest/holy/modules/spells/Renew';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { formatNumber } from 'common/format';

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

  get renewBuffsAppliedFromRevitalizingPrayers() {
    return this.renew.renewsFromRevitalizingPrayers;
  }

  get fullLengthRenewsFromRevitalizingPrayers() {
    return this.renew.revitalizingPrayersRenewDurations;
  }

  get healingFromRevitalizingPrayersRenews() {
    return this.renew.healingFromRenew(this.fullLengthRenewsFromRevitalizingPrayers);
  }

  get overhealingFromRevitalizingPrayersRenews() {
    return this.renew.overhealingFromRenew(this.fullLengthRenewsFromRevitalizingPrayers);
  }

  get absorbedHealingFromRevitalizingPrayersRenews() {
    return this.renew.absorptionFromRenew(this.fullLengthRenewsFromRevitalizingPrayers);
  }

  statistic() {
    return (
      <Statistic
        tooltip={
          <>
            Revitalizing Prayers procced{' '}
            {formatNumber(this.renewBuffsAppliedFromRevitalizingPrayers)} times.
            <br />
            This is equivalent to {this.fullLengthRenewsFromRevitalizingPrayers.toFixed(1)} full
            legnth renews.
          </>
        }
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
