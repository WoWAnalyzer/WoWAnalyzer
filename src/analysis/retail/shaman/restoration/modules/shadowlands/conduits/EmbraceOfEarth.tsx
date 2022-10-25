import { EARTHSHIELD_HEALING_INCREASE } from 'analysis/retail/shaman/shared';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { EMBRACE_OF_EARTH_RANKS } from '../../../constants';

/**
 * Earth Shield increases your healing done to the target by an additional x%
 */
class EmbraceOfEarth extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  protected combatants!: Combatants;

  conduitRank = 0;
  boost = 0;
  healing = 0;

  constructor(options: Options) {
    super(options);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.EMBRACE_OF_EARTH.id);
    if (!this.conduitRank) {
      this.active = false;
      return;
    }
    this.boost = EMBRACE_OF_EARTH_RANKS[this.conduitRank] / 100;

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.normalizeBoost);
  }

  normalizeBoost(event: HealEvent) {
    const target = this.combatants.getEntity(event);
    if (!target) {
      return;
    }

    if (target.hasBuff(TALENTS.EARTH_SHIELD_TALENT.id, event.timestamp, 0, 0)) {
      // idea
      // heal = boostedHeal / (1.2 + x)
      // bonusHeal = heal * x
      const boostedHeal = (event.amount || 0) + (event.absorbed || 0) + (event.overheal || 0);
      const heal = boostedHeal / (1 + EARTHSHIELD_HEALING_INCREASE + this.boost);
      const bonusHeal = heal * this.boost;
      const effectiveHealing = Math.max(0, bonusHeal - (event.overheal || 0));
      this.healing += effectiveHealing;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <ConduitSpellText spellId={SPELLS.EMBRACE_OF_EARTH.id} rank={this.conduitRank}>
          <ItemHealingDone amount={this.healing} />
          <br />
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default EmbraceOfEarth;
