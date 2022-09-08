import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import { ELYSIAN_DECREE_VENGEANCE_TALENT } from 'common/TALENTS/demonhunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Elysian Decree
 */
class ElysianDecree extends Analyzer {
  damage = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(ELYSIAN_DECREE_VENGEANCE_TALENT.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ELYSIAN_DECREE_DAMAGE, SPELLS.ELYSIAN_DECREE_REPEAT_DECREE_DAMAGE]),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={<>{formatThousands(this.damage)} Total damage</>}
      >
        <BoringSpellValueText spellId={ELYSIAN_DECREE_VENGEANCE_TALENT.id}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ElysianDecree;
