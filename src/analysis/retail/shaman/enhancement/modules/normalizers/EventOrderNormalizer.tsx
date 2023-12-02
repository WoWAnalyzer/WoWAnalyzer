import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { Options } from 'parser/core/Analyzer';
import BaseEventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { AnyEvent, EventType } from 'parser/core/Events';
import { MAELSTROM_WEAPON_MS } from '../../constants';

/** Thorim's Invocation automatically casts Lightning Bolts when Windstrike used, but
 * these free casts appear in the event log prior to the windstrike. Re-order so the Windstrike
 * comes first. */
const thorimsInvocationEventOrder: EventOrder = {
  beforeEventId: SPELLS.WINDSTRIKE_CAST.id,
  beforeEventType: EventType.Cast,
  afterEventId: [SPELLS.LIGHTNING_BOLT.id, TALENTS.CHAIN_LIGHTNING_TALENT.id],
  afterEventType: EventType.Cast,
  bufferMs: MAELSTROM_WEAPON_MS,
  anyTarget: true,
  updateTimestamp: true,
};

/**
 * In some instances, the comes before the cast, so normalize to force it after
 */
const healingOrder: EventOrder = {
  afterEventId: [SPELLS.HEALING_SURGE.id, TALENTS.CHAIN_HEAL_TALENT.id],
  afterEventType: [EventType.Heal, EventType.HealAbsorbed],
  beforeEventId: [SPELLS.HEALING_SURGE.id, TALENTS.CHAIN_HEAL_TALENT.id],
  beforeEventType: EventType.Cast,
  anyTarget: true,
  bufferMs: MAELSTROM_WEAPON_MS,
  updateTimestamp: true,
};

/** The primordial wave buff is consumed before the lightning bolt it buffs is cast. The APL requires
 * the buff to be present when checking for the lightning bolt casts */
const primordialWaveEventOrder: EventOrder = {
  afterEventId: SPELLS.PRIMORDIAL_WAVE_BUFF.id,
  afterEventType: EventType.RemoveBuff,
  beforeEventId: SPELLS.LIGHTNING_BOLT.id,
  beforeEventType: EventType.Cast,
  anyTarget: true,
  bufferMs: 100,
  updateTimestamp: true,
};

export class EventOrderNormalizer extends BaseEventOrderNormalizer {
  constructor(options: Options) {
    super(options, [thorimsInvocationEventOrder, healingOrder, primordialWaveEventOrder]);
  }

  /** After the base normalize is done, we're changing all auto-casts of Lightning Bolt
   * from Windstrike into 'freecast' so they don't interfere with the APL */
  normalize(events: AnyEvent[]) {
    events = super.normalize(events);

    const fixedEvents: AnyEvent[] = [];
    const thorimsInvocationCastIds = [SPELLS.LIGHTNING_BOLT.id, TALENTS.CHAIN_LIGHTNING_TALENT.id];
    const windstrikeId = SPELLS.WINDSTRIKE_CAST.id;

    events.forEach((event: AnyEvent, idx: number) => {
      fixedEvents.push(event);
      // non-cast events are irrelevant
      if (event.type !== EventType.Cast) {
        return;
      }
      // only interested in Lightning Bolt and Chain Lightning
      const spellId = event.ability.guid;
      if (!thorimsInvocationCastIds.includes(spellId)) {
        return;
      }

      // For ChL and LB casts, look backwards for a Windstrike cast
      for (let backwardsIndex = idx - 1; backwardsIndex >= 0; backwardsIndex -= 1) {
        const backwardsEvent = events[backwardsIndex];
        // The windstrike and auto cast typically occur on the same timestamp
        if (event.timestamp - backwardsEvent.timestamp > MAELSTROM_WEAPON_MS) {
          break;
        }

        if (
          backwardsEvent.type !== EventType.Cast ||
          backwardsEvent.ability.guid !== windstrikeId
        ) {
          continue;
        }

        fixedEvents.splice(idx, 1);
        fixedEvents.push({
          ...event,
          type: EventType.FreeCast,
          __modified: true,
        });
      }
    });

    return fixedEvents;
  }
}
