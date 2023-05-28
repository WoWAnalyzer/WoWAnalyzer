import Renew from 'analysis/retail/priest/holy/modules/spells/Renew';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options } from 'parser/core/Analyzer';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { formatNumber } from 'common/format';
import { SpellLink } from 'interface';
import TalentSpellText from 'parser/ui/TalentSpellText';

// Example Log: /report/w9BXrzFApPbj6LnG/14-Mythic+Dathea,+Ascended+-+Wipe+13+(3:14)/Benchmepls/standard/statistics
class RevitalizingPrayers extends Analyzer {
  static dependencies = {
    renew: Renew,
  };
  protected renew!: Renew;

  constructor(options: Options) {
    super(options);
    if (!this.selectedCombatant.hasTalent(TALENTS.REVITALIZING_PRAYERS_TALENT)) {
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
            legnth <SpellLink id={TALENTS.RENEW_TALENT.id} /> cast
            {this.fullLengthRenewsFromRevitalizingPrayers > 1 ? 's' : ''}.
          </>
        }
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(6)}
      >
        <TalentSpellText talent={TALENTS.REVITALIZING_PRAYERS_TALENT}>
          <ItemHealingDone amount={this.healingFromRevitalizingPrayersRenews} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default RevitalizingPrayers;
