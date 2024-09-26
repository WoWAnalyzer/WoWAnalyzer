import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class DiabolicRitualEmpowers extends Analyzer {
  ruination_damage = 0;
  infernal_bolt_damage = 0;
  // TODO : calculate Cloven souls damage
  // cloven souls is a debuff on enemy, all damage warlock do is increased by 5%
  // calculate damage done when debuff is up and get 5% from it
  // see Arcane Mage - Touch of the magi

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DIABOLIC_RITUAL_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RUINATION_DAMAGE),
      this.handleFelseekerDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.INFERNAL_BOLT),
      this.handleInfernalBoltDamage,
    );
  }

  handleFelseekerDamage(event: DamageEvent) {
    this.ruination_damage += event.amount + (event.absorbed || 0);
  }

  handleInfernalBoltDamage(event: DamageEvent) {
    console.log('infernal bolt dmg : ' + event.amount);
    this.infernal_bolt_damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`${formatThousands(this.ruination_damage + this.infernal_bolt_damage)} damage`}
      >
        <BoringSpellValueText spell={TALENTS.DIABOLIC_RITUAL_TALENT}>
          <small>Ruination, Infernal bolt damage</small>
          <br />
          <ItemDamageDone amount={this.ruination_damage + this.infernal_bolt_damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DiabolicRitualEmpowers;
