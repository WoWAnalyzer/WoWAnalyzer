import Analyzer, { Options } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_MONK } from 'common/TALENTS';

import { LIFE_COCOON_HEALING_BOOST } from '../../constants';
import TalentSpellText from 'parser/ui/TalentSpellText';

class LifeCocoon extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  healing: number = 0;
  protected combatants!: Combatants;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.heal, this.cocoonBuff);
  }

  cocoonBuff(event: HealEvent) {
    //Life Cocoon works on any HoT that has this flag checked even if they don't come from the mistweaver themselves
    if (!event.tick) {
      return;
    }

    const target = this.combatants.players[event.targetID];

    if (!target) {
      return;
    }

    if (target.hasBuff(TALENTS_MONK.LIFE_COCOON_TALENT.id, event.timestamp, 0, 0)) {
      this.healing += calculateEffectiveHealing(event, LIFE_COCOON_HEALING_BOOST);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(70)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={<>Life Cocoon boosts HoTs from other players as wells as your own.</>}
      >
        <TalentSpellText talent={TALENTS_MONK.LIFE_COCOON_TALENT}>
          <ItemHealingDone amount={this.healing} />
          <br />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default LifeCocoon;
