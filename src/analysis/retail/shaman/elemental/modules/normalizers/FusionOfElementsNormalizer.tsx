import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import Spell from 'common/SPELLS/Spell';
import { spellToAbility } from 'common/spellToAbility';
import MAGIC_SCHOOLS, { isMatchingDamageType } from 'game/MAGIC_SCHOOLS';
import { AnyEvent, ApplyBuffEvent, EventType, RefreshBuffEvent } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

const FUSION_OF_ELEMENTS_DURATION_MS = 20000;

const FUSION_ELIGIBLE_SPELLS = [
  TALENTS.EARTH_SHOCK_TALENT.id,
  TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT.id,
  SPELLS.LIGHTNING_BOLT.id,
  TALENTS.CHAIN_LIGHTNING_TALENT.id,
  SPELLS.LAVA_BURST_DAMAGE.id,
  SPELLS.FLAME_SHOCK.id,
];

class FusionOfElementsNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]): AnyEvent[] {
    const fixedEvents: AnyEvent[] = [];
    let lastAppliedTimestamp = 0;

    const activeFusionBuffs: Record<number, number> = {
      [SPELLS.FUSION_OF_THE_ELEMENTS_FIRE_BUFF.id]: 0,
      [SPELLS.FUSION_OF_THE_ELEMENTS_NATURE_BUFF.id]: 0,
    };

    events.forEach((event) => {
      // always add the current event
      fixedEvents.push(event);
      // if the timestamp difference is greater than the duration of the buff, remove the buff

      if (event.type === EventType.Cast) {
        // if the event is a cast event, check if it's a spell that applies a fusion buff
        if (event.ability.guid === SPELLS.ICEFURY_CAST.id) {
          lastAppliedTimestamp = event.timestamp;
          fixedEvents.push(
            this.createFusionOfElementsBuff(
              SPELLS.FUSION_OF_THE_ELEMENTS_FIRE_BUFF,
              event.timestamp,
              activeFusionBuffs[SPELLS.FUSION_OF_THE_ELEMENTS_FIRE_BUFF.id] > 0,
            ),
            this.createFusionOfElementsBuff(
              SPELLS.FUSION_OF_THE_ELEMENTS_NATURE_BUFF,
              event.timestamp,
              activeFusionBuffs[SPELLS.FUSION_OF_THE_ELEMENTS_NATURE_BUFF.id] > 0,
            ),
          );
          activeFusionBuffs[SPELLS.FUSION_OF_THE_ELEMENTS_FIRE_BUFF.id] = event.timestamp;
          activeFusionBuffs[SPELLS.FUSION_OF_THE_ELEMENTS_NATURE_BUFF.id] = event.timestamp;
        }
      }
      if (
        event.type === EventType.Damage &&
        (event.tick === undefined || !event.tick) &&
        FUSION_ELIGIBLE_SPELLS.includes(event.ability.guid)
      ) {
        /* check if it removes a fusion buff */
        if (
          activeFusionBuffs[SPELLS.FUSION_OF_THE_ELEMENTS_FIRE_BUFF.id] > 0 &&
          isMatchingDamageType(event.ability.type, MAGIC_SCHOOLS.ids.FIRE)
        ) {
          fixedEvents.push({
            type: EventType.RemoveBuff,
            timestamp: event.timestamp,
            sourceID: this.selectedCombatant.id,
            targetID: this.selectedCombatant.id,
            targetIsFriendly: true,
            sourceIsFriendly: true,
            ability: spellToAbility(
              SPELLS.FUSION_OF_THE_ELEMENTS_FIRE_BUFF,
              MAGIC_SCHOOLS.ids.PHYSICAL,
            )!,
          });
          activeFusionBuffs[SPELLS.FUSION_OF_THE_ELEMENTS_FIRE_BUFF.id] = 0;
        }
        if (
          activeFusionBuffs[SPELLS.FUSION_OF_THE_ELEMENTS_NATURE_BUFF.id] > 0 &&
          isMatchingDamageType(event.ability.type, MAGIC_SCHOOLS.ids.NATURE)
        ) {
          fixedEvents.push({
            type: EventType.RemoveBuff,
            timestamp: event.timestamp,
            sourceID: this.selectedCombatant.id,
            targetID: this.selectedCombatant.id,
            targetIsFriendly: true,
            sourceIsFriendly: true,
            ability: spellToAbility(
              SPELLS.FUSION_OF_THE_ELEMENTS_NATURE_BUFF,
              MAGIC_SCHOOLS.ids.PHYSICAL,
            )!,
          });
          activeFusionBuffs[SPELLS.FUSION_OF_THE_ELEMENTS_NATURE_BUFF.id] = 0;
        }
      }

      if (event.timestamp - lastAppliedTimestamp >= FUSION_OF_ELEMENTS_DURATION_MS) {
        Object.entries(activeFusionBuffs).forEach(([spellId, timestamp]) => {
          if (timestamp > 0) {
            fixedEvents.push({
              timestamp: event.timestamp,
              type: EventType.RemoveBuff,
              sourceID: this.selectedCombatant.id,
              targetID: this.selectedCombatant.id,
              ability: spellToAbility(SPELLS[Number(spellId)], MAGIC_SCHOOLS.ids.PHYSICAL)!,
              targetIsFriendly: true,
              sourceIsFriendly: true,
            });
            activeFusionBuffs[Number(spellId)] = 0;
          }
        });
      }
    });

    return fixedEvents;
  }

  // create fusion of element buff from the passed Spell
  private createFusionOfElementsBuff(
    spell: Spell,
    timestamp: number,
    isRefresh: boolean,
  ): ApplyBuffEvent | RefreshBuffEvent {
    return {
      sourceID: this.selectedCombatant.id,
      targetID: this.selectedCombatant.id,
      targetIsFriendly: true,
      sourceIsFriendly: true,
      type: isRefresh ? EventType.RefreshBuff : EventType.ApplyBuff,
      timestamp: timestamp,
      ability: spellToAbility(spell, MAGIC_SCHOOLS.ids.PHYSICAL)!,
    };
  }
}

export default FusionOfElementsNormalizer;
