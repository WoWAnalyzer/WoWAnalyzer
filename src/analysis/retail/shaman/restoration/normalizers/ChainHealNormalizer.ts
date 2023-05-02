import { FLOW_OF_THE_TIDES_INCREASE } from '../constants';
import talents from 'common/TALENTS/shaman';
import { CastEvent, HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import CritEffectBonus from 'parser/shared/modules/helpers/CritEffectBonus';
import HIT_TYPES from 'game/HIT_TYPES';
import { getChainHeals, wasRiptideConsumed } from './CastLinkNormalizer';
import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';

interface BufferHealEvent extends HealEvent {
  baseHealingDone: number;
}

class ChainHealNormalizer extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    critEffectBonus: CritEffectBonus,
    combatants: Combatants,
  };

  protected statTracker!: StatTracker;
  protected critEffectBonus!: CritEffectBonus;
  protected combatants!: Combatants;

  /*
   * Due to how Chain Heal interacts with the combatlog, we have to take a lot of extra steps here.
   * Issues:
   * 1. The healing events are backwards [4,3,2,1]
   * 2. If the Shaman heals themselves, that healing event is always first [3,4,2,1] (3 = Shaman)
   * 3. If 2. happens, the heal on the shaman is also happening before the cast event, which the event linking already dealt with.
   * External modifiers need to be reverse calculated:
   * 1. Mastery Effectiveness
   * 2. Deluge
   * 3. Crits
   * 4. Flow of the Tides (if talented && has to be the primary target for riptide
   *    to be consumed -- all hits are increased by 30%)
   *
   * NOTE: With everything else calc'ed correctly deluge will not matter,
   * since 20% variance by itself will not cause jumps that decrease by 30% to be ordered incorrectly
   * */
  public normalizeChainHealOrder(cast: CastEvent): HealEvent[] {
    const events = getChainHeals(cast);
    const baseHealEvents: BufferHealEvent[] = [];
    if (events.length > 0) {
      events.forEach((heal) => baseHealEvents.push(this.calculateBaseChainHeal(heal, cast)));
      //return sort order based on base heal
    }
    return baseHealEvents.sort((a, b) => b.baseHealingDone - a.baseHealingDone) as HealEvent[];
  }

  private calculateBaseChainHeal(event: HealEvent, cast: CastEvent): BufferHealEvent {
    let heal = event.amount + (event.absorbed || 0) + (event.overheal || 0);
    if (event.hitType === HIT_TYPES.CRIT) {
      const critMult = this.critEffectBonus.getBonus(event);
      heal /= critMult;
    }
    const currentMastery = this.statTracker.currentMasteryPercentage;
    const masteryEffectiveness = Math.max(
      0,
      1 - (event.hitPoints - event.amount) / event.maxHitPoints,
    );
    heal /= 1 + currentMastery * masteryEffectiveness;
    //check for flow of the tides increase
    if (this.selectedCombatant.hasTalent(talents.FLOW_OF_THE_TIDES_TALENT)) {
      if (wasRiptideConsumed(cast)) {
        heal /= 1 + FLOW_OF_THE_TIDES_INCREASE;
      }
    }
    return { baseHealingDone: heal, ...event };
  }
}

export default ChainHealNormalizer;
