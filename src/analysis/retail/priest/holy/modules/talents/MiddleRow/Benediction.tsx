import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { BENEDICTION_RENEW_HEALS } from '../../../normalizers/CastLinkNormalizer';
import Events, { HasRelatedEvent, HealEvent } from 'parser/core/Events';
import Renew from '../../spells/Renew';

// Example Log: /report/PNYB4zgrnR86h7Lc/6-Normal+Zek'voz,+Herald+of+N'zoth/Khadaj
class Benediction extends Analyzer {
  static dependencies = {
    renew: Renew,
  };

  protected renew!: Renew;

  healingFromRenew = 0;
  absorptionFromRenew = 0;
  overhealingFromRenew = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BENEDICTION_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.RENEW_TALENT),
      this.onRenewHeal,
    );
  }

  onRenewHeal(event: HealEvent) {
    if (HasRelatedEvent(event, BENEDICTION_RENEW_HEALS)) {
      this.healingFromRenew += event.amount || 0;
      this.overhealingFromRenew += event.overheal || 0;
      this.absorptionFromRenew += event.absorbed || 0;
    }
  }

  get renewsFromBenediction() {
    return this.renew.renewsFromBenediction;
  }

  statistic() {
    return (
      <Statistic
        tooltip={`${this.renewsFromBenediction} total Renews from Benediction`}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(6)}
      >
        <BoringSpellValueText spell={TALENTS.BENEDICTION_TALENT}>
          <ItemHealingDone amount={this.healingFromRenew} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Benediction;
