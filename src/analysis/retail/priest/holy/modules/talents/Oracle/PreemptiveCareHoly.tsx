import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import { Options } from 'parser/core/Module';
import Events, { ApplyBuffEvent, RefreshBuffEvent } from 'parser/core/Events';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import RenewTracker from './OracleCore/RenewTracker';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { isRenewFromSalv } from '../../../normalizers/CastLinkNormalizer';
import HotTracker, { Attribution } from 'parser/shared/modules/HotTracker';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import { PREEMPTIVE_CARE_RENEW_DUR } from '../../../constants';

class PreemptiveCareHoly extends Analyzer {
  static dependencies = {
    renewTracker: RenewTracker,
    combatants: Combatants,
  };

  protected renewTracker!: RenewTracker;
  protected combatants!: Combatants;
  attribution: Attribution = HotTracker.getNewAttribution('Preemptive Care');

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.PREEMPTIVE_CARE_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.RENEW_TALENT),
      this.onApplyRenew,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.RENEW_TALENT),
      this.onApplyRenew,
    );
  }

  onApplyRenew(event: ApplyBuffEvent | RefreshBuffEvent) {
    const target = this.combatants.getEntity(event);
    if (!target) {
      return;
    }
    if (isRenewFromSalv(event)) {
      return;
    }

    this.renewTracker.addExtension(
      this.attribution,
      PREEMPTIVE_CARE_RENEW_DUR,
      target.id,
      TALENTS_PRIEST.RENEW_TALENT.id,
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS_PRIEST.PREEMPTIVE_CARE_TALENT}>
          <ItemPercentHealingDone amount={this.attribution.healing} /> <br />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default PreemptiveCareHoly;
