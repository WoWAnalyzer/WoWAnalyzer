import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Enemies from 'parser/shared/modules/Enemies';

const DAMAGE_INCREASE = 0.25;

//Example log: /report/VXr2kgALF3Rj6Q4M/11-Mythic+Anduin+Wrynn+-+Kill+(5:12)/Litena/standard/statistics
class SearingLight extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  damageFromTalent = 0;

  constructor(options: Options) {
    super(options);
    if (!this.selectedCombatant.hasTalent(TALENTS.SEARING_LIGHT_TALENT)) {
      this.active = false;
      return;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SMITE), this.onSmite);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.HOLY_NOVA_TALENT),
      this.onHolyNova,
    );
  }

  onSmite(event: DamageEvent) {
    const target = this.enemies.getEntity(event);
    if (target !== null && target.hasBuff(SPELLS.HOLY_FIRE.id)) {
      this.damageFromTalent += calculateEffectiveDamage(event, DAMAGE_INCREASE);
    }
  }

  onHolyNova(event: DamageEvent) {
    const target = this.enemies.getEntity(event);
    if (target !== null && target.hasBuff(SPELLS.HOLY_FIRE.id)) {
      this.damageFromTalent += calculateEffectiveDamage(event, DAMAGE_INCREASE);
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(15)}
      >
        <TalentSpellText talent={TALENTS.SEARING_LIGHT_TALENT}>
          <ItemDamageDone amount={this.damageFromTalent} />
        </TalentSpellText>
      </Statistic>
    );
  }
}
export default SearingLight;
