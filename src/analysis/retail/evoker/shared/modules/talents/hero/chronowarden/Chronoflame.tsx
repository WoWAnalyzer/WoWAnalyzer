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

class Chronoflame extends Analyzer {
  chronoflameHealing: number = 0;
  chronoflameDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.CHRONO_FLAME_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CHRONO_FLAME_HEAL),
      this.onChronoHeal,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CHRONO_FLAME_DAMAGE),
      this.onChronoDamage,
    );
  }

  onChronoHeal(event: HealEvent) {
    this.chronoflameHealing += event.amount;
  }

  onChronoDamage(event: DamageEvent) {
    this.chronoflameDamage += event.amount;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS_EVOKER.CHRONO_FLAME_TALENT}>
          <div>
            <ItemDamageDone amount={this.chronoflameDamage} />
            <br />
            <ItemHealingDone amount={this.chronoflameHealing} />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Chronoflame;
