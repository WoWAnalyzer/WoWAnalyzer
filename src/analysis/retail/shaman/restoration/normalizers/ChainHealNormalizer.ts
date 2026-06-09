import HIT_TYPES from 'game/HIT_TYPES';
import EventLinkNormalizer from 'parser/core/EventLinkNormalizer';
import Analyzer from 'parser/core/Analyzer';
import {
  CastEvent,
  HealEvent
} from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import StatTracker from 'parser/shared/modules/StatTracker';
import CritEffectBonus from 'parser/shared/modules/helpers/CritEffectBonus';
import {
    EVENT_LINKS,
    healingIncreases,
    ANCENDANCE_TARGET,
    FLOW_OF_THE_TIDES_TARGET,
    ANCESTRAL_REACH_TARGET,
    CHAIN_HEAL_TARGETS,
} from '../constants';
import {
  isLivelyTotemsChainHealCast,
  getChainHeals,
  wasRiptideConsumed,

} from './EventLinkNormalizer';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';

// Normalizes the HEAL Events of all CHAINHEAL casts


class ChainHealAnalyzer extends Analyzer {
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
   * 4. Flow of the Tides (if talented && has to be the primary target for riptide to be consumed. All hits are increased by 30%)
   * NOTE: With everything else calc'ed correctly deluge will not matter,
   * since 15% variance by itself will not cause jumps that decrease by 30% to be ordered incorrectly
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
    const choiceTalent =
    this.selectedCombatant.hasTalent(TALENTS.FLOW_OF_THE_TIDES_TALENT)? TALENTS.FLOW_OF_THE_TIDES_TALENT:
    this.selectedCombatant.hasTalent(TALENTS.ANCESTRAL_REACH_TALENT)? TALENTS.ANCESTRAL_REACH_TALENT:
    null;
    const currentMastery = this.statTracker.currentMasteryPercentage;
    const masteryEffectiveness = Math.max(0, 1 - (event.hitPoints - event.amount) / event.maxHitPoints);
    heal /= 1 + currentMastery * masteryEffectiveness;
    switch (choiceTalent) {
      case TALENTS.FLOW_OF_THE_TIDES_TALENT: {//check for flow of the tides increase
        if (wasRiptideConsumed(cast)) {
          heal /= 1 + healingIncreases.FLOW_OF_THE_TIDES_INCREASE;
        }
        break;
      }
      case TALENTS.ANCESTRAL_REACH_TALENT: {//check for ANCESTRAL REACH increase
        heal /= 1 + healingIncreases.ANCESTRAL_REACH_INCREASE;
        break;
      }
    }return { baseHealingDone: heal, ...event };
  }
}
interface BufferHealEvent extends HealEvent {
  baseHealingDone: number;
}

export default ChainHealAnalyzer;
