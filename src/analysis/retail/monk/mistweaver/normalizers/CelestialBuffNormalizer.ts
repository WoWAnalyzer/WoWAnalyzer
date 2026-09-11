import { TALENTS_MONK } from 'common/TALENTS';
import Spell from 'common/SPELLS/Spell';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import {
  AnyEvent,
  ApplyBuffEvent,
  EventType,
  HasTarget,
  RemoveBuffEvent,
} from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

// fabricates invoke chi-ji buff events since we can only
// signal from the pet's (chi-ji) summon to its death (rip bird)
class CelestialBuffNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]): AnyEvent[] {
    if (!this.selectedCombatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT)) {
      return events;
    }

    const buffSpell = TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT;
    const fabricated: { index: number; event: AnyEvent }[] = [];
    let open = false;

    events.forEach((event, index) => {
      if (
        event.type === EventType.Cast &&
        event.ability.guid === TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT.id &&
        event.sourceID === this.owner.playerId
      ) {
        if (open) {
          fabricated.push({ index, event: this.removeBuff(buffSpell, event.timestamp) });
        }
        open = true;
        fabricated.push({ index, event: this.applyBuff(buffSpell, event.timestamp) });
        return;
      }

      if (open && this.isPetDeath(event)) {
        fabricated.push({ index, event: this.removeBuff(buffSpell, event.timestamp) });
        open = false;
      }
    });

    if (open) {
      fabricated.push({
        index: events.length,
        event: this.removeBuff(buffSpell, this.owner.fight.end_time),
      });
    }

    if (fabricated.length === 0) {
      return events;
    }

    fabricated.reverse().forEach(({ index, event }) => {
      events.splice(index, 0, event);
    });
    return events;
  }

  private isPetDeath(event: AnyEvent): boolean {
    if (event.type !== EventType.Death || !HasTarget(event)) {
      return false;
    }
    return (
      event.targetID === this.owner.playerId ||
      this.owner.playerPets.some((pet) => pet.id === event.targetID)
    );
  }

  private applyBuff(spell: Spell, timestamp: number): ApplyBuffEvent {
    return {
      ...this.buffEvent(spell, timestamp),
      type: EventType.ApplyBuff,
    };
  }

  private removeBuff(spell: Spell, timestamp: number): RemoveBuffEvent {
    return {
      ...this.buffEvent(spell, timestamp),
      type: EventType.RemoveBuff,
    };
  }

  private buffEvent(spell: Spell, timestamp: number) {
    return {
      ability: {
        guid: spell.id,
        name: spell.name,
        abilityIcon: spell.icon,
        type: MAGIC_SCHOOLS.ids.NATURE,
      },
      timestamp,
      sourceID: this.owner.playerId,
      sourceIsFriendly: true as const,
      targetID: this.owner.playerId,
      targetIsFriendly: true as const,
      __fabricated: true as const,
    };
  }
}

export default CelestialBuffNormalizer;
