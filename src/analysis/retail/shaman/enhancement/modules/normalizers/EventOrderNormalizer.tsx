import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import { Options } from 'parser/core/Analyzer';
import BaseEventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { AnyEvent, EventType, HasAbility } from 'parser/core/Events';
import { NormalizerOrder } from './constants';
import { EventLinkBuffers } from '../../constants';

/** Thorim's Invocation automatically casts Lightning Bolts when Windstrike used, but
 * these free casts appear in the event log prior to the windstrike. Re-order so the Windstrike
 * comes first. */

//"windstrike" "lightning bolt" "tempest"
const thorimsInvocationSpellAfterWindstrike: EventOrder = {
  beforeEventId: SPELLS.WINDSTRIKE_CAST.id,
  beforeEventType: EventType.Cast,
  afterEventId: [
    SPELLS.LIGHTNING_BOLT.id,
    TALENTS.CHAIN_LIGHTNING_TALENT.id,
    SPELLS.TEMPEST_CAST.id,
  ],
  afterEventType: EventType.Cast,
  bufferMs: EventLinkBuffers.MaelstromWeapon,
  anyTarget: true,
  updateTimestamp: true,
  maxMatches: 1,
};

const thorimsInvocationBuffAfterSpell: EventOrder = {
  beforeEventId: [
    SPELLS.LIGHTNING_BOLT.id,
    TALENTS.CHAIN_LIGHTNING_TALENT.id,
    SPELLS.TEMPEST_CAST.id,
  ],
  beforeEventType: EventType.Cast,
  afterEventId: SPELLS.MAELSTROM_WEAPON_BUFF.id,
  afterEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
  bufferMs: EventLinkBuffers.MaelstromWeapon,
  anyTarget: true,
  updateTimestamp: true,
  maxMatches: 1,
};

/**
 * In some instances, the healcomes before the cast, so normalize to force it after
 */
const healingOrder: EventOrder = {
  afterEventId: [SPELLS.HEALING_SURGE.id, TALENTS.CHAIN_HEAL_TALENT.id],
  afterEventType: [EventType.Heal, EventType.HealAbsorbed],
  beforeEventId: [SPELLS.HEALING_SURGE.id, TALENTS.CHAIN_HEAL_TALENT.id],
  beforeEventType: EventType.Cast,
  anyTarget: true,
  bufferMs: EventLinkBuffers.MaelstromWeapon,
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
  private readonly hasRollingThunder: boolean;
  constructor(options: Options) {
    super(options, [
      thorimsInvocationSpellAfterWindstrike,
      thorimsInvocationBuffAfterSpell,
      healingOrder,
      primordialWaveEventOrder,
    ]);

    this.priority = NormalizerOrder.EventOrderNormalizer;

    this.hasRollingThunder = this.selectedCombatant.hasTalent(TALENTS.ROLLING_THUNDER_TALENT);
  }

  /** After the base normalize is done, we're changing all auto-casts of Lightning Bolt, Chain Lightning, and Tempest
   * from Windstrike into 'freecast' so they don't interfere with the APL */
  normalize(events: AnyEvent[]) {
    events = super.normalize(events);

    const fixedEvents: AnyEvent[] = [];
    const thorimsInvocationCastIds: number[] = [
      SPELLS.LIGHTNING_BOLT.id,
      TALENTS.CHAIN_LIGHTNING_TALENT.id,
      SPELLS.TEMPEST_CAST.id,
    ];
    const windstrikeId = SPELLS.WINDSTRIKE_CAST.id;
    const skipEvents = new Set<AnyEvent>();

    events.forEach((event: AnyEvent, idx: number) => {
      if (!skipEvents.has(event)) {
        fixedEvents.push(event);
      }
      // non-cast events are irrelevant
      if (event.type !== EventType.Cast) {
        return;
      }

      const spellId = event.ability.guid;
      if (thorimsInvocationCastIds.includes(spellId)) {
        // For ChL, LB, and Tempest casts, look backwards for a Windstrike cast
        for (let backwardsIndex = idx - 1; backwardsIndex >= 0; backwardsIndex -= 1) {
          const backwardsEvent = events[backwardsIndex];
          // The windstrike and auto cast typically occur on the same timestamp
          if (event.timestamp - backwardsEvent.timestamp > EventLinkBuffers.MaelstromWeapon) {
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
      }

      /** This interaction is a bug. The maelstrom is consumed after the cast so doesn't increase damage, but does apply to
       * Static Accumulation refund. */

      /** The Rolling Thunder hero talent summons the feral spirt AFTER the tempest cast (but before damage). The issue
       * with this is when a feral spirit is summoned, it also immediately generates 1 stack of msw, but because this
       * appearing after, we need to move it back. a traditional order normalizer doesn't move the events correctly */
      //return;
      if (this.hasRollingThunder && spellId === SPELLS.TEMPEST_CAST.id) {
        const eventsToMoveBack: AnyEvent[] = [];
        for (let forwardIndex = idx + 1; forwardIndex < events.length; forwardIndex += 1) {
          const forwardEvent = events[forwardIndex];
          if (forwardEvent.timestamp - event.timestamp > 15 || !HasAbility(forwardEvent)) {
            break;
          }
          if (
            (forwardEvent.ability.guid === SPELLS.SUMMON_FERAL_SPIRIT.id &&
              [EventType.Summon].includes(forwardEvent.type)) ||
            (forwardEvent.ability.guid === SPELLS.FERAL_SPIRIT_MAELSTROM_BUFF.id &&
              [EventType.ApplyBuff, EventType.RefreshBuff].includes(forwardEvent.type)) ||
            (forwardEvent.ability.guid === SPELLS.MAELSTROM_WEAPON_BUFF.id &&
              [EventType.ApplyBuff, EventType.ApplyBuffStack, EventType.RefreshBuff].includes(
                forwardEvent.type,
              ))
          ) {
            eventsToMoveBack.push(forwardEvent);
            // once the first maelstrom event is hit, exit out
            if (forwardEvent.ability.guid === SPELLS.MAELSTROM_WEAPON_BUFF.id) {
              break;
            }
          }
        }
        if (eventsToMoveBack.length === 3) {
          // update timestamp
          eventsToMoveBack.forEach((e) => {
            e.timestamp = event.timestamp;
            e.__reordered = true;
            skipEvents.add(e);
          });

          const currentEvent = fixedEvents.splice(idx, 1, ...eventsToMoveBack);
          fixedEvents.push(...currentEvent);
        }
      }
    });

    return fixedEvents;
  }
}
