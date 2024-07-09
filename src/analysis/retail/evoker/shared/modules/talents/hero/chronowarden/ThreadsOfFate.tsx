import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent, DamageEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_EVOKER } from 'common/TALENTS';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SPELLS from 'common/SPELLS';

class ThreadsOfFate extends Analyzer {
  threadHealing: number = 0;
  threadDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.THREADS_OF_FATE_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.THREADS_OF_FATE_HEALING),
      this.onThreadHeal,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.THREADS_OF_FATE_DAMAGE),
      this.onThreadDamage,
    );
  }

  onThreadHeal(event: HealEvent) {
    this.threadHealing += event.amount;
  }

  onThreadDamage(event: DamageEvent) {
    this.threadDamage += event.amount;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS_EVOKER.THREADS_OF_FATE_TALENT}>
          <div>
            <ItemDamageDone amount={this.threadDamage} />
            <br />
            <ItemHealingDone amount={this.threadHealing} />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ThreadsOfFate;
