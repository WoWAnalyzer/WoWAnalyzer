import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import { COLLECTIVE_ANGUISH_VENGEANCE_TALENT } from 'common/TALENTS/demonhunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class CollectiveAnguish extends Analyzer {
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(COLLECTIVE_ANGUISH_VENGEANCE_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.EYE_BEAM_DAMAGE),
      this.onDamageEvent,
    );
  }

  onDamageEvent(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={<>{formatThousands(this.damage)} Total damage</>}
      >
        <BoringSpellValueText spellId={COLLECTIVE_ANGUISH_VENGEANCE_TALENT.id}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CollectiveAnguish;
