import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SPECS from 'game/SPECS';
import TalentSpellText from 'parser/ui/TalentSpellText';

class CollectiveAnguish extends Analyzer {
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.COLLECTIVE_ANGUISH_TALENT);
    if (!this.active) {
      return;
    }
    const spell =
      this.selectedCombatant.specId === SPECS.HAVOC_DEMON_HUNTER.id
        ? SPELLS.COLLECTIVE_ANGUISH_FEL_DEVASTATION
        : SPELLS.COLLECTIVE_ANGUISH_EYE_BEAM;
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(spell), this.onDamageEvent);
  }

  onDamageEvent(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={<>{formatThousands(this.damage)} Total damage</>}
      >
        <TalentSpellText talent={TALENTS_DEMON_HUNTER.COLLECTIVE_ANGUISH_TALENT}>
          <ItemDamageDone amount={this.damage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default CollectiveAnguish;
