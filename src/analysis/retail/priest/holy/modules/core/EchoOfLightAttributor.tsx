import Analyzer from 'parser/core/Analyzer';
import { GetRelatedEvents, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { ECHO_OF_LIGHT_ATTRIB_EVENT } from '../../normalizers/CastLinkNormalizer';
import { ABILITIES_THAT_DONT_TRIGGER_MASTERY, PRISMATIC_ECHOES_PER_RANK } from '../../constants';
import StatTracker from 'parser/shared/modules/StatTracker';
class EOLAttrib extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  protected statTracker!: StatTracker;
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
   *  it is calculated by looking at up to the next 6s of EOL ticks after a heal event
   *  to get average overhealing, then it is raw healing event * mastery % * scaled overhealing
   *
   *  ASSUMPTION: whether or not the hot gets infinitely extended or pool empties within 2 ticks
   *  won't have a noticeable impact on the value since any extensions would be a smaller and smaller value
   *  of the inital heal and overhealing in theory shouldnt massively swing anyways
   */
  public getEchoOfLightHealingAttrib(eolEvent: HealEvent) {
    const currentMastery = this.statTracker.currentMasteryPercentage * this.masteryScaler;
    const initialHeal =
      currentMastery * (eolEvent.amount + (eolEvent.absorbed || 0) + (eolEvent.overheal || 0));
    let eolTicksHeal = 0;
    let eolTicksOverHeal = 0;

    // blacklist non EOL heals
    if (ABILITIES_THAT_DONT_TRIGGER_MASTERY.includes(eolEvent.ability.guid)) {
      return 0;
    }

    // get average healing/overhealing over the next 6s of EOL
    const eolHealEvents = GetRelatedEvents(eolEvent, ECHO_OF_LIGHT_ATTRIB_EVENT);
    if (eolHealEvents.length > 0) {
      Object.values(eolHealEvents).forEach((eolHealEvent) => {
        eolHealEvent = eolHealEvent as HealEvent;
        eolTicksHeal += eolHealEvent.amount + (eolHealEvent.absorbed || 0);
        eolTicksOverHeal += eolHealEvent.overheal || 0;
      });
    }

    //scale calculated EOL by how much overhealing the average ticks did
    if (eolTicksHeal + eolTicksOverHeal !== 0) {
      return (initialHeal * eolTicksHeal) / (eolTicksHeal + eolTicksOverHeal);
    }
    return 0;
  }

  /**
   * copy and paste of the previous except it applies getEffectiveHealing math to
   * the theoretical results per tick of EoL
   */
  public getEchoOfLightAmpAttrib(eolEvent: HealEvent, relativeHealIncrease: number) {
    const currentMastery = this.statTracker.currentMasteryPercentage * this.masteryScaler;
    const initialHeal =
      currentMastery * (eolEvent.amount + (eolEvent.absorbed || 0) + (eolEvent.overheal || 0));
    let eolTicksHeal = 0;
    let eolTicksOverHeal = 0;
    let totalEOLAmpHealing = 0;

    // blacklist non EOL heals
    if (ABILITIES_THAT_DONT_TRIGGER_MASTERY.includes(eolEvent.ability.guid)) {
      return 0;
    }

    const eolHealEvents = GetRelatedEvents(eolEvent, ECHO_OF_LIGHT_ATTRIB_EVENT);

    /**
     * if ticks exist, get the amount each tick overhealed and apply that against the
     * initial heal (raw * mastery %) divided per tick number, and apply getEffectiveHealing math per tick
     */
    if (eolHealEvents.length > 0) {
      const initialHealPerTick = initialHeal / eolHealEvents.length;

      Object.values(eolHealEvents).forEach((eolHealEvent) => {
        eolHealEvent = eolHealEvent as HealEvent;
        eolTicksHeal += eolHealEvent.amount + (eolHealEvent.absorbed || 0);
        eolTicksOverHeal += eolHealEvent.overheal || 0;

        // this is a copy paste of getEffectiveHealing
        if (eolTicksHeal + eolTicksOverHeal !== 0) {
          const overheal =
            (initialHealPerTick * eolTicksOverHeal) / (eolTicksHeal + eolTicksOverHeal);
          const relativeHealingIncreaseFactor = 1 + relativeHealIncrease;
          const healingIncrease =
            initialHealPerTick - initialHealPerTick / relativeHealingIncreaseFactor;
          const effectiveHealing = healingIncrease - overheal;
          totalEOLAmpHealing += Math.max(0, effectiveHealing);
        }
      });
    }
    return totalEOLAmpHealing || 0;
  }
}

export default EOLAttrib;
