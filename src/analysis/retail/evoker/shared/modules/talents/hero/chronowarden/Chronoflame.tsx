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
import SPECS from 'game/SPECS';

class Chronoflame extends Analyzer {
  chronoflameHealing = 0;
  chronoflameDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.CHRONO_FLAME_TALENT);
    if (this.owner.selectedCombatant.specId === SPECS.PRESERVATION_EVOKER.id) {
      // Don't include healing for Aug as not useful info
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CHRONO_FLAME_HEAL),
        this.onChronoHeal,
      );
    }
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
          {this.owner.selectedCombatant.specId === SPECS.PRESERVATION_EVOKER.id && (
            <div>
              <ItemHealingDone amount={this.chronoflameHealing} />
            </div>
          )}
          <div>
            <ItemDamageDone amount={this.chronoflameDamage} />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Chronoflame;
