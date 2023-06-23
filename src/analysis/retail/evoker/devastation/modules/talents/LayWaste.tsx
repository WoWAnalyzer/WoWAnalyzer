import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { LAY_WASTE_MULTIPLIER } from 'analysis/retail/evoker/devastation/constants';
import TalentSpellText from 'parser/ui/TalentSpellText';

const { DEEP_BREATH_DAM } = SPELLS;

class LayWaste extends Analyzer {
  layWasteDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.LAY_WASTE_TALENT);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(DEEP_BREATH_DAM), this.onHit);
  }

  onHit(event: DamageEvent) {
    this.layWasteDamage += calculateEffectiveDamage(event, LAY_WASTE_MULTIPLIER);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={<li>Damage: {formatNumber(this.layWasteDamage)}</li>}
      >
        <TalentSpellText talent={TALENTS.LAY_WASTE_TALENT}>
          <ItemDamageDone amount={this.layWasteDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default LayWaste;
