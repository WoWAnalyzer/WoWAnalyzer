import Renew from 'analysis/retail/priest/holy/modules/spells/Renew';
import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HasRelatedEvent, HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { LIGHTWELL_RENEW_HEALS } from '../../../normalizers/CastLinkNormalizer';

// Example Log: /report/PNYB4zgrnR86h7Lc/6-Normal+Zek'voz,+Herald+of+N'zoth/Khadaj
class Lightwell extends Analyzer {
  static dependencies = {
    renew: Renew,
  };
  Lightwell = 0;
  healingFromLightwell = 0;
  overhealingFromLightwell = 0;
  absorptionFromLightwell = 0;

  healingFromRenew = 0;
  absorptionFromRenew = 0;
  overhealingFromRenew = 0;

  protected renew!: Renew;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.LIGHTWELL_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIGHTWELL_TALENT_HEAL),
      this.onHeal,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.RENEW_TALENT),
      this.onRenewHeal,
    );
  }

  get totalHealing() {
    return this.healingFromLightwell + this.healingFromRenew;
  }

  get totalOverHealing() {
    return this.overhealingFromLightwell + this.overhealingFromRenew;
  }

  get totalAbsorbed() {
    return this.absorptionFromLightwell + this.absorptionFromRenew;
  }

  onHeal(event: HealEvent) {
    this.healingFromLightwell += event.amount || 0;
    this.overhealingFromLightwell += event.overheal || 0;
    this.absorptionFromLightwell += event.absorbed || 0;
  }

  onRenewHeal(event: HealEvent) {
    if (HasRelatedEvent(event, LIGHTWELL_RENEW_HEALS)) {
      this.healingFromRenew += event.amount || 0;
      this.overhealingFromRenew += event.overheal || 0;
      this.absorptionFromRenew += event.absorbed || 0;
    }
  }

  statistic() {
    return (
      <Statistic
        tooltip={
          <>
            Healing from Lightwell:{' '}
            {formatThousands(this.healingFromLightwell + this.absorptionFromLightwell)}
            <br />
            Healing from Renews: {formatThousands(this.healingFromRenew + this.absorptionFromRenew)}
          </>
        }
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(7)}
      >
        <BoringSpellValueText spell={TALENTS.LIGHTWELL_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Lightwell;
