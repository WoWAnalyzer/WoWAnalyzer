import SPELLS from 'common/SPELLS';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { EventType } from 'parser/core/Events';

/**
 * Shuriken Storm Energize events reporting overcaping of CPs.
 *
 * @param {Array} events
 * @returns {Array} Events possibly with some reordered.
 */
class ShurikenStormNormalizer extends EventsNormalizer {

  /**
   * Shuriken Storm should never provide less then 3CP.
   * If less then 3 CPs were generated, it most likely was a mistake to cast this spell.
   * We will remove all waste from casts that generated at least 3 CPs, because under normal circumstances you never finish with 3CP deficit.
   * In some cases it may be better to use a different builder, but even if it is a damage or proc loss to Shuriken Storm in these situations, its still not a CP waste.
   *
   * If less the 3CPs were generated, we can consider anything up to the Max CP cap as waste.
   * Logic behind this: If finisher was used instead, next Shuriken Storm would generate CPs up to the max CP pool.
   */
  minCPs = 3;

  normalize(events) {
    const fixedEvents = [];

    //Player CP Pool
    let cpPool = 5;
    if(this.selectedCombatant.hasTalent(SPELLS.DEEPER_STRATAGEM_TALENT.id)) {
      cpPool += 1;
    }

    events.forEach((event, eventIndex) => {
      fixedEvents.push(event);

      // Find Shuriken Storm CP Events
      if(event.type === EventType.Energize && event.ability.guid === SPELLS.SHURIKEN_STORM_CP.id) {
        //Remove excess waste from Shuriken Storm.
        if(event.waste > 0) {
          if(event.resourceChange - event.waste >= this.minCPs) {
            //Consider the event as having no waste
            event.resourceChange = event.resourceChange - event.waste;
            event.waste = 0;
          } else {
            //Clear off extra waste that would go over the max CP
            const newWaste = Math.min(event.waste, cpPool);
            event.resourceChange = event.resourceChange - event.waste + newWaste;
            event.waste = newWaste;
          }
        }
      }
    });

    return fixedEvents;
  }
}

export default ShurikenStormNormalizer;
