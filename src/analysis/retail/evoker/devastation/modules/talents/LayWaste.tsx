import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent } from 'parser/core/Events';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { LAY_WASTE_MULTIPLIER } from 'analysis/retail/evoker/devastation/constants';
import TalentSpellText from 'parser/ui/TalentSpellText';

const { FIRE_BREATH_DOT } = SPELLS;

class LayWaste extends Analyzer {
  deepBreathDamage: number = 0;
  layWasteDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.LAY_WASTE_TALENT);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(FIRE_BREATH_DOT), this.onHit);
  }

  onHit(event: DamageEvent) {
    this.deepBreathDamage += event.amount;
    if (event.absorbed !== undefined) {
      this.deepBreathDamage += event.absorbed;
    }
  }

  statistic() {
    this.layWasteDamage =
      this.deepBreathDamage - this.deepBreathDamage / (1 + LAY_WASTE_MULTIPLIER);

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>Damage: {formatNumber(this.layWasteDamage)}</li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.LAY_WASTE_TALENT}>
          <ItemDamageDone amount={this.layWasteDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default LayWaste;
