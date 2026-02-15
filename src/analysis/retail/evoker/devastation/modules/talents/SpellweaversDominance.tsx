import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';
import HIT_TYPES from 'game/HIT_TYPES';

import Analyzer, { Options } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamageFromCritDamageIncrease } from 'parser/core/EventCalculateLib';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import {
  DAMAGE_SPELLS_THAT_CAN_CRIT,
  SPELLWEAVERS_DOMINANCE_CRIT_MULTIPLIER,
} from 'analysis/retail/evoker/devastation/constants';
import TalentSpellText from 'parser/ui/TalentSpellText';

class SpellweaversDominance extends Analyzer {
  SpellweaversDominanceDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SPELLWEAVERS_DOMINANCE_TALENT);

    this.addEventListener(Events.damage.spell(DAMAGE_SPELLS_THAT_CAN_CRIT), this.onHit);
  }

  onHit(event: DamageEvent) {
    if (event.hitType === HIT_TYPES.CRIT) {
      this.SpellweaversDominanceDamage += calculateEffectiveDamageFromCritDamageIncrease(
        event,
        SPELLWEAVERS_DOMINANCE_CRIT_MULTIPLIER,
      );
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={<li>Damage: {formatNumber(this.SpellweaversDominanceDamage)}</li>}
      >
        <TalentSpellText talent={TALENTS.SPELLWEAVERS_DOMINANCE_TALENT}>
          <ItemDamageDone amount={this.SpellweaversDominanceDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default SpellweaversDominance;
