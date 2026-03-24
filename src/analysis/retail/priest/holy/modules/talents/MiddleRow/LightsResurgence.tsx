import { TALENTS_PRIEST } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HasRelatedEvent, HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { LR_RENEW_HEALS } from '../../../normalizers/CastLinkNormalizer';

/**
 * Light's Resurgence
 * Your Prayer of Mending has a 12% chance to leave a Renew on each target it heals.
 */

class LightsResurgence extends Analyzer {
  healingFromRenew = 0;
  overhealingFromRenew = 0;
  absorptionFromRenew = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.LIGHTS_RESURGENCE_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RENEW_HEAL),
      this.onRenewHeal,
    );
  }

  onRenewHeal(event: HealEvent) {
    if (HasRelatedEvent(event, LR_RENEW_HEALS)) {
      this.healingFromRenew += event.amount || 0;
      this.overhealingFromRenew += event.overheal || 0;
      this.absorptionFromRenew += event.absorbed || 0;
    }
  }

  statistic() {
    return (
      <Statistic
        tooltip="Renews applied by Light's Resurgence"
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(6)}
      >
        <BoringSpellValueText spell={TALENTS_PRIEST.LIGHTS_RESURGENCE_TALENT}>
          <ItemHealingDone amount={this.healingFromRenew + this.absorptionFromRenew} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default LightsResurgence;