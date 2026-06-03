import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

class FireNova extends Analyzer {
  private damage = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.FIRE_NOVA_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FIRE_NOVA_DAMAGE),
      this.onDamage,
    );
  }

  private onDamage(event: DamageEvent) {
    if (event.targetIsFriendly) {
      return;
    }

    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <TalentSpellText talent={TALENTS.FIRE_NOVA_TALENT}>
          <ItemDamageDone amount={this.damage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default FireNova;
