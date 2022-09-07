import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

// Example Log: /report/hRd3mpK1yTQ2tDJM/1-Mythic+MOTHER+-+Kill+(2:24)/14-丶寶寶小喵
class TrailOfLight extends Analyzer {
  totalToLProcs = 0;
  totalToLHealing = 0;
  totalToLOverhealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.TRAIL_OF_LIGHT_TALENT.id);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.TRAIL_OF_LIGHT_HEAL),
      this.onHeal,
    );
  }

  onHeal(event: HealEvent) {
    this.totalToLProcs += 1;
    this.totalToLHealing += event.overheal || 0;
    this.totalToLOverhealing += event.amount || 0;
  }

  statistic() {
    return (
      <Statistic
        tooltip={`Trail of Light Procs: ${this.totalToLProcs}`}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(1)}
      >
        <BoringSpellValueText spellId={SPELLS.TRAIL_OF_LIGHT_TALENT.id}>
          <ItemHealingDone amount={this.totalToLHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TrailOfLight;
