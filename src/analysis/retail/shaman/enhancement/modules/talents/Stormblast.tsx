import { TALENTS_SHAMAN } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';

class StormBlast extends Analyzer {
  damage = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.STORMBLAST_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS_SHAMAN.STORMBLAST_TALENT),
      this.onDamageEvent,
    );
  }

  onDamageEvent(event: DamageEvent) {
    this.damage += event.amount;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS_SHAMAN.STORMBLAST_TALENT}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default StormBlast;
