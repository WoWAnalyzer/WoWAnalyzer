import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamageFromCritIncrease } from 'parser/core/EventCalculateLib';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import {
  DAMAGE_SPELLS_THAT_CAN_CRIT,
  HONED_AGGRESSION_CRIT_INCREASE_PER_RANK,
} from 'analysis/retail/evoker/devastation/constants';
import TalentSpellText from 'parser/ui/TalentSpellText';
import HIT_TYPES from 'game/HIT_TYPES';
import StatTracker from 'parser/shared/modules/StatTracker';

class HonedAggression extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  protected statTracker!: StatTracker;

  totalDamage = 0;
  critIncrease = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.HONED_AGGRESSION_TALENT);

    this.critIncrease =
      HONED_AGGRESSION_CRIT_INCREASE_PER_RANK *
      this.selectedCombatant.getTalentRank(TALENTS.HONED_AGGRESSION_TALENT);

    this.addEventListener(Events.damage.spell(DAMAGE_SPELLS_THAT_CAN_CRIT), this.onHit);
  }

  onHit(event: DamageEvent) {
    if (event.hitType === HIT_TYPES.CRIT) {
      this.totalDamage += calculateEffectiveDamageFromCritIncrease(
        event,
        this.statTracker.currentCritPercentage,
        this.critIncrease,
      );
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={<li>Damage: {formatNumber(this.totalDamage)}</li>}
      >
        <TalentSpellText talent={TALENTS.HONED_AGGRESSION_TALENT}>
          <ItemDamageDone amount={this.totalDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default HonedAggression;
