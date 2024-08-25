import Analyzer from 'parser/core/Analyzer';
import { GetRelatedEvents, HasRelatedEvent, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import { TALENTS_PRIEST } from 'common/TALENTS';
import {
  ECHO_OF_LIGHT_ATTRIB_EVENT,
  ECHO_OF_LIGHT_BUFF_REFRESH,
} from '../../../../normalizers/CastLinkNormalizer';
import { ABILITIES_THAT_DONT_TRIGGER_MASTERY } from '../../../../constants';
import StatTracker from 'parser/shared/modules/StatTracker';

const PRISMATIC_ECHOES_PER_RANK = 0.06;

class EchoOfLightAttributor extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    statTracker: StatTracker,
  };

  protected combatants!: Combatants;
  protected statTracker!: StatTracker;

  // Temporary value used as flags or for calculations
  private uptoTicks = 0;
  private tickNum = 0;
  private eolHealing = 0;
  private eolOverhealing = 0;
  private masteryScaler = 1;

  constructor(options: Options) {
    super(options);
    this.active = true;
    if (this.selectedCombatant.hasTalent(TALENTS_PRIEST.PRISMATIC_ECHOES_TALENT)) {
      const talentRank = this.selectedCombatant.getTalentRank(
        TALENTS_PRIEST.PRISMATIC_ECHOES_TALENT,
      );
      this.masteryScaler *= talentRank * PRISMATIC_ECHOES_PER_RANK + 1;
    }
  }

  /** Attributor for a spell's EOL amount,
   *  it is calculated by lookingat the next 3/4 EOL ticks after a heal event
   *  to get average overhealing, then it is raw healing event * mastery % * scaled overhealing
   *
   *  ASSUMPTION: whether or not the hot gets infinitely extended or pool empties within 2 ticks
   *  won't have a noticeable impact on the value since any extensions would be a smaller and smaller value
   *  of the inital heal and overhealing in theory shouldnt massively swing anyways
   */
  public getEchoOfLightHealingAttrib(eolEvent: HealEvent) {
    const passedEventId = eolEvent.ability.guid;
    const currentMastery = this.statTracker.currentMasteryPercentage;
    const initialHeal = eolEvent.amount + (eolEvent.absorbed || 0) + (eolEvent.overheal || 0);

    //blacklist non EOL heals as a double check if someone forgot to do it when this function is called
    if (
      ABILITIES_THAT_DONT_TRIGGER_MASTERY.includes(passedEventId) ||
      !HasRelatedEvent(eolEvent, ECHO_OF_LIGHT_ATTRIB_EVENT)
    ) {
      return 0;
    }
    //if buff is refreshed look at 3 ticks instead of 2 (https://mechanicalpriest.com/compendium/stats-and-scaling#mastery)
    if (HasRelatedEvent(eolEvent, ECHO_OF_LIGHT_BUFF_REFRESH)) {
      this.uptoTicks = 3;
    } else {
      this.uptoTicks = 2;
    }

    const eolHealEvents = GetRelatedEvents(eolEvent, ECHO_OF_LIGHT_ATTRIB_EVENT);
    if (eolHealEvents.length > 0) {
      this.eolHealing = 0;
      this.eolOverhealing = 0;
      this.tickNum = 0;
      const empty: HealEvent[] = []; //eslint....
      Object.values(
        eolHealEvents.reduce((n, eolHeal) => {
          eolHeal = eolHeal as HealEvent;
          if (this.tickNum < this.uptoTicks) {
            this.eolHealing += eolHeal.amount + (eolHeal.absorbed || 0);
            this.eolOverhealing += eolHeal.overheal || 0;
            this.tickNum += 1;
          }
          return n;
        }, empty),
      );
    }
    //scale theoretical EOL by how much overhealing the avrage ticks did
    if (this.eolHealing + this.eolOverhealing !== 0) {
      return (
        (currentMastery * this.masteryScaler * initialHeal * this.eolHealing) /
        (this.eolHealing + this.eolOverhealing)
      );
    }
    return 0;
  }

  /**
   * copy and paste of the previous except it takes a heal amp and call GetEffectiveHealing
   * on the results of the eolhealing + overhealing
   */
  public getEchoOfLightAmpAttrib(eolEvent: HealEvent, relativeHealIncrease: number) {
    const passedEventId = eolEvent.ability.guid;
    const currentMastery = this.statTracker.currentMasteryPercentage;
    const initialHeal = eolEvent.amount + (eolEvent.absorbed || 0) + (eolEvent.overheal || 0);
    if (
      ABILITIES_THAT_DONT_TRIGGER_MASTERY.includes(passedEventId) ||
      !HasRelatedEvent(eolEvent, ECHO_OF_LIGHT_ATTRIB_EVENT)
    ) {
      return 0;
    }
    if (HasRelatedEvent(eolEvent, ECHO_OF_LIGHT_BUFF_REFRESH)) {
      this.uptoTicks = 3;
    } else {
      this.uptoTicks = 2;
    }

    const eolHealEvents = GetRelatedEvents(eolEvent, ECHO_OF_LIGHT_ATTRIB_EVENT);
    if (eolHealEvents.length > 0) {
      this.eolHealing = 0;
      this.eolOverhealing = 0;
      this.tickNum = 0;
      const empty: HealEvent[] = []; //eslint....
      Object.values(
        eolHealEvents.reduce((n, eolHeal) => {
          eolHeal = eolHeal as HealEvent;
          if (this.tickNum < this.uptoTicks) {
            this.eolHealing += eolHeal.amount + (eolHeal.absorbed || 0);
            this.eolOverhealing += eolHeal.overheal || 0;
            this.tickNum += 1;
          }
          return n;
        }, empty),
      );
    }

    if (this.eolHealing + this.eolOverhealing !== 0) {
      const overheal =
        currentMastery *
        1.12 *
        ((initialHeal * this.eolOverhealing) / (this.eolHealing + this.eolOverhealing));
      const raw = currentMastery * this.masteryScaler * initialHeal;
      const relativeHealingIncreaseFactor = 1 + relativeHealIncrease;
      const healingIncrease = raw - raw / relativeHealingIncreaseFactor;
      const effectiveHealing = healingIncrease - overheal;

      return Math.max(0, effectiveHealing);
    }
    return 0;
  }
}

export default EchoOfLightAttributor;
