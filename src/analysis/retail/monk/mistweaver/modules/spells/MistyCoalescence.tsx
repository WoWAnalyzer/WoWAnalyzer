import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { ApplyBuffEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import { MISTY_COALESCENCE_MAX_INCREASE } from '../../constants';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { formatPercentage } from 'common/format';
import SpellLink from 'interface/SpellLink';

class MistyCoalescence extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  remCounts: number[] = [];
  combatants!: Combatants;
  currentRems = 0;
  healing = 0;
  constructor(options: any) {
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
    this.remCounts.push(this.currentRems);
  }

  get currentIncrease() {
    return this.currentRems / this.combatants.playerCount;
  }

  get avgRems() {
    return this.remCounts.reduce((count, acc) => count + acc, 0) / this.remCounts.length || 0;
  }

  get averageIncrease() {
    return (this.avgRems / this.combatants.playerCount) * MISTY_COALESCENCE_MAX_INCREASE;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(21)}
        size="flexible"
        tooltip={
          <>
            {this.avgRems.toFixed(2)} average <SpellLink spell={SPELLS.RENEWING_MIST_HEAL} />
            (s) on a {this.combatants.playerCount} player group.
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.MISTY_COALESCENCE_TALENT}>
          {formatPercentage(this.averageIncrease)}% <small> average increase</small>
          <br />
          <ItemHealingDone amount={this.healing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default MistyCoalescence;
