import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

import { TALENTS_PRIEST } from 'common/TALENTS';
import Events, { HealEvent } from 'parser/core/Events';
import { CRISIS_MANAGEMENT_PER_RANK, HOLY_DIRECT_HEALS } from '../../../constants';
import StatTracker from 'parser/shared/modules/StatTracker';
import HIT_TYPES from 'game/HIT_TYPES';

class CrisisManagement extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  protected statTracker!: StatTracker;
  private cmMod = 0;
  private cmTotal = 0;
  private critMult = 2;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.CRISIS_MANAGEMENT_TALENT);
    this.cmMod +=
      this.selectedCombatant.getTalentRank(TALENTS_PRIEST.CRISIS_MANAGEMENT_TALENT) *
      CRISIS_MANAGEMENT_PER_RANK;

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(HOLY_DIRECT_HEALS), this.cmHeal);
  }

  /**
   *  approximating value of crit rate increase by getting the total amount of
   *  flash heal and heal crits, then attributing an average of each heal based on
   *  crit inc from CM/total crit
   */
  cmHeal(event: HealEvent) {
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    const amount = event.amount;
    const absorbed = event.absorbed || 0;
    const overheal = event.overheal || 0;
    const raw = amount + absorbed + overheal;
    const relativeHealingIncreaseFactor = this.critMult;
    const healingIncrease = raw - raw / relativeHealingIncreaseFactor;
    const effectiveHealing = healingIncrease - overheal;

    const effectiveCritHit = Math.max(0, effectiveHealing);

    this.cmTotal +=
      (effectiveCritHit * this.cmMod) / (this.statTracker.currentCritPercentage + this.cmMod);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_PRIEST.CRISIS_MANAGEMENT_TALENT}>
          <ItemPercentHealingDone amount={this.cmTotal} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default CrisisManagement;
