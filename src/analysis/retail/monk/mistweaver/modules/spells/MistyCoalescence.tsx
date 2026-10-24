import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { ApplyBuffEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import { MISTY_COALESCENCE_MAX_INCREASE, MISTY_COALESCENCE_MAX_RAID_REMS } from '../../constants';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { formatPercentage } from 'common/format';

class MistyCoalescence extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  increaseTotal = 0;
  healCount = 0;
  combatants!: Combatants;
  currentRems = 0;
  healing = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.MISTY_COALESCENCE_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.onApplyRem,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.onRemoveRem,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.onHeal,
    );
  }

  onApplyRem(event: ApplyBuffEvent) {
    this.currentRems += 1;
  }
  onRemoveRem(event: RemoveBuffEvent) {
    this.currentRems -= 1;
  }

  onHeal(event: HealEvent) {
    this.healing += calculateEffectiveHealing(
      event,
      this.currentIncrease * MISTY_COALESCENCE_MAX_INCREASE,
    );
    this.increaseTotal += this.currentIncrease;
    this.healCount += 1;
  }

  get cappedGroupSize() {
    return Math.min(this.combatants.playerCount, MISTY_COALESCENCE_MAX_RAID_REMS);
  }

  get currentIncrease() {
    const cappedRems = Math.min(this.currentRems, MISTY_COALESCENCE_MAX_RAID_REMS);
    return cappedRems / this.cappedGroupSize;
  }

  // averaged per heal since the bonus is applied per heal, not over time
  get averageIncrease() {
    return (this.increaseTotal / this.healCount || 0) * MISTY_COALESCENCE_MAX_INCREASE;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(21)} size="flexible">
        <TalentSpellText talent={TALENTS_MONK.MISTY_COALESCENCE_TALENT}>
          <div>
            {formatPercentage(this.averageIncrease)}% <small> average increase</small>
          </div>
          <div>
            <ItemHealingDone amount={this.healing} />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default MistyCoalescence;
