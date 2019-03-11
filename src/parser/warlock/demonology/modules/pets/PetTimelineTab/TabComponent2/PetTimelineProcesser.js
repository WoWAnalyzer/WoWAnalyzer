import SpellHistory from 'parser/shared/modules/SpellHistory';
import Combatants from 'parser/shared/modules/Combatants';
import SPELLS from 'common/SPELLS';

import { isWildImp } from '../../helpers';
import DemoPets from '../../DemoPets';

const NETHER_PORTAL_DURATION = 15000;
const NEARBY_CASTS_BUFFER = 250;
const NEARBY_CAST_COUNT = 3;

export default class PetTimelineProcesser {
  parser = null;
  historyBySpellId = null;
  selectedCombatant = null;
  petTimeline = null;
  secondWidth = null;

  constructor(parser, secondWidth) {
    this.parser = parser;
    this.secondWidth = secondWidth;
    this.historyBySpellId = parser.getModule(SpellHistory).historyBySpellId;
    this.selectedCombatant = parser.getModule(Combatants).selected;
    this.petTimeline = parser.getModule(DemoPets).timeline;
  }

  get groupedPets() {
    // should group pets and return an array of objects probably
    const _pets = this.petTimeline.groupPetsBySummonAbility();
    // pets is now object, where key is the summon ability (string, because it's a key) and value is an array
    // PetRow needs start (from parser), secondWidth, totalWidth, and also the value of the individual pet

    // pets in the array contain properties:
    // spawn (number), realDespawn or expectedDespawn (numbers), summonAbility (number or string "unknown")
    // meta (object with properties "tooltip" (string), "iconClass" (string)), name (string)

    const pets = {};
    Object.entries(_pets).forEach(([summonAbilityId, petObject]) => {
      // summonAbilityId is either string "unknown" or summonedBy property of the pet (source of the pet from player's perspective)
      pets[summonAbilityId] = petObject.pets.map(pet => {
        const left = this.getOffsetLeft(pet.spawn);
        const isSummonAbilityKnown = !!SPELLS[pet.summonAbility];
        // TODO: limit the pet duration with fight length? end - start?
        const petDuration = ((pet.realDespawn || pet.expectedDespawn) - pet.spawn) / 1000 * this.secondWidth;
        return {
          left,
          isSummonAbilityKnown,
          petDuration,
          meta: pet.meta,
          summonAbility: pet.summonAbility,
          name: pet.name,
        };
      });
    });
    return pets;
  }

  get start() {
    return this.parser.fight.start_time;
  }

  getOffsetLeft(timestamp) {
    return (timestamp - this.start) / 1000 * this.secondWidth;
  }

  get keyEvents() {
    // gets important events - Tyrant cast, Implosion, Power Siphon, Nether Portal cast and duration, casts during Nether Portal
    let events = this.importantEvents;
    events = this.decorateCloseCasts(events);
    events = this.decorateImplosionCasts(events);

    // KeyCastsRow also needs start, totalWidth, secondWidth, for positioning
    // event here contains:
    // if type === 'cast'
    //    type (string), timestamp (number) extraInfo (string?), nearbyCasts (string[]), important (bool), abilityId (number)
    // else if type === 'duration'
    //    type (string), endTimestamp (number), timestamp (number)

    // positioning is done using start (from parser), secondWidth
    return events.map(event => ({
      left: this.getOffsetLeft(event.timestamp),
      ...event,
    }));
  }

  get importantEvents() {
    // these casts are extracted manually with flag "important"
    const importantEvents = [];
    const manualCastIds = [SPELLS.SUMMON_DEMONIC_TYRANT.id, SPELLS.IMPLOSION_CAST.id, SPELLS.NETHER_PORTAL_TALENT.id, SPELLS.POWER_SIPHON_TALENT.id];
    const tyrantCasts = this.filterHistoryCasts(SPELLS.SUMMON_DEMONIC_TYRANT.id);
    const implosionCasts = this.filterHistoryCasts(SPELLS.IMPLOSION_CAST.id);
    const powerSiphonCasts = this.filterHistoryCasts(SPELLS.POWER_SIPHON_TALENT.id);
    importantEvents.push(...tyrantCasts, ...implosionCasts, ...powerSiphonCasts);
    if (this.selectedCombatant.hasTalent(SPELLS.NETHER_PORTAL_TALENT.id)) {
      const netherPortalCasts = this.filterHistoryCasts(SPELLS.NETHER_PORTAL_TALENT.id);
      const netherPortalWindows = netherPortalCasts.map(cast => ({
        type: 'duration',
        timestamp: cast.timestamp,
        endTimestamp: cast.timestamp + NETHER_PORTAL_DURATION,
      }));
      const castsDuringNetherPortal = [];
      if (netherPortalCasts.length > 0) {
        // iterate through all spells
        Object.keys(this.historyBySpellId)
          .filter(key => !manualCastIds.includes(Number(key))) // filter out casts we got manually
          .map(key => this.historyBySpellId[key])
          .forEach(historyArray => {
            // filter casts and only those, that fall into any Nether Portal window
            const casts = historyArray
              .filter(event => event.type === 'cast'
                && netherPortalWindows.some(window => window.timestamp <= event.timestamp
                  && event.timestamp <= window.endTimestamp))
              .map(event => ({
                type: 'cast',
                timestamp: event.timestamp,
                abilityId: event.ability.guid,
                abilityName: event.ability.name,
              }));
            castsDuringNetherPortal.push(...casts);
          });
      }
      importantEvents.push(...netherPortalCasts, ...netherPortalWindows, ...castsDuringNetherPortal);
    }
    return importantEvents.sort((event1, event2) => event1.timestamp - event2.timestamp);
  }

  decorateCloseCasts(events) {
    // iterate through each cast, look if there are another casts very nearby, if so, save their names
    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];
      if (event.type !== 'cast') {
        continue;
      }
      // check N surrounding casts on both sides, if they are within BUFFER, save their names
      const minI = Math.max(i - NEARBY_CAST_COUNT, 0);
      const maxI = Math.min(i + NEARBY_CAST_COUNT, events.length - 1);
      const leftLimit = event.timestamp - NEARBY_CASTS_BUFFER;
      const rightLimit = event.timestamp + NEARBY_CASTS_BUFFER;
      for (let j = minI; j <= maxI; j += 1) {
        if (j === i || events[j].type !== 'cast') {
          continue;
        }
        if (leftLimit <= events[j].timestamp && events[j].timestamp <= rightLimit) {
          event.nearbyCasts = event.nearbyCasts || [];
          event.nearbyCasts.push(events[j].abilityName);
        }
      }
    }
    return events;
  }

  decorateImplosionCasts(events) {
    events.filter(event => event.type === 'cast' && event.abilityId === SPELLS.IMPLOSION_CAST.id)
      .forEach(cast => {
        const impCount = this.petTimeline.getPetsAtTimestamp(cast.timestamp).filter(pet => isWildImp(pet.guid) && pet.shouldImplode).length;
        cast.extraInfo = `Imploded ${impCount} Wild Imp${impCount > 1 ? 's' : ''}`;
      });
    return events;
  }

  filterHistoryCasts(id) {
    if (!this.historyBySpellId[id]) {
      return [];
    }
    return this.historyBySpellId[id]
      .filter(event => event.type === 'cast')
      .map(event => ({
        type: 'cast',
        important: true,
        timestamp: event.timestamp,
        abilityId: event.ability.guid,
        abilityName: event.ability.name,
      }));
  }
}
