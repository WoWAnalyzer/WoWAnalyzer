import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import { Options } from 'parser/core/Analyzer';
import BaseEventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { AnyEvent, EventType, HasAbility } from 'parser/core/Events';
import { NormalizerOrder } from './constants';
import { EventLinkBuffers } from '../../constants';

/** Thorim's Invocation automatically discharges Lightning Bolt/Chain Lightning/Tempest during
 * Doom Winds or Ascendance when Stormstrike/Crash Lightning/Windstrike is used.
 * These auto-casts can appear in the event log prior to the triggering cast, so re-order to ensure
 * the triggering cast comes first. */

// trigger (stormstrike/crash lightning/windstrike) -> discharge (lb/chl/tempest)
const thorimsInvocationSpellAfterTrigger: EventOrder = {
  beforeEventId: [
    SPELLS.STORMSTRIKE.id,
    SPELLS.WINDSTRIKE_CAST.id,
    TALENTS.CRASH_LIGHTNING_TALENT.id,
  ],
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

export class EventOrderNormalizer extends BaseEventOrderNormalizer {
  private readonly hasThorimsInvocation: boolean;
  constructor(options: Options) {
    super(options, [thorimsInvocationSpellAfterTrigger, thorimsInvocationBuffAfterSpell]);

    this.priority = NormalizerOrder.EventOrderNormalizer;

    this.hasThorimsInvocation = this.selectedCombatant.hasTalent(TALENTS.THORIMS_INVOCATION_TALENT);
  }

  /** After the base normalize is done, we're changing all auto-casts of Lightning Bolt, Chain Lightning, and Tempest
   * from Thorim's Invocation into 'freecast' so they don't interfere with the APL */
  normalize(events: AnyEvent[]) {
    if (this.hasThorimsInvocation) {
      events = super.normalize(events);
    }

    const fixedEvents: AnyEvent[] = [];
    const thorimsInvocationCastIds: number[] = [
      SPELLS.LIGHTNING_BOLT.id,
      TALENTS.CHAIN_LIGHTNING_TALENT.id,
      SPELLS.TEMPEST_CAST.id,
    ];
    const thorimsInvocationTriggerIds: number[] = [
      SPELLS.STORMSTRIKE.id,
      SPELLS.WINDSTRIKE_CAST.id,
      TALENTS.CRASH_LIGHTNING_TALENT.id,
    ];
    const skipEvents = new Set<AnyEvent>();

    let doomWindsActive = false;
    let ascendanceActive = false;

    events.forEach((event: AnyEvent, idx: number) => {
      if (!skipEvents.has(event)) {
        fixedEvents.push(event);
      }
      if (!HasAbility(event)) {
        return;
      }

      // Track active windows for gating Thorim's Invocation free casts.
      if (event.type === EventType.ApplyBuff || event.type === EventType.RefreshBuff) {
        if (event.ability.guid === SPELLS.DOOM_WINDS_BUFF.id) {
          doomWindsActive = true;
        }
        if (event.ability.guid === TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id) {
          ascendanceActive = true;
        }
      }
      if (event.type === EventType.RemoveBuff) {
        if (event.ability.guid === SPELLS.DOOM_WINDS_BUFF.id) {
          doomWindsActive = false;
        }
        if (event.ability.guid === TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id) {
          ascendanceActive = false;
        }
      }

      // Only cast events can be tagged as FreeCast.
      if (event.type !== EventType.Cast || !this.hasThorimsInvocation) {
        return;
      }

      const spellId = event.ability.guid;
      if (!thorimsInvocationCastIds.includes(spellId)) {
        return;
      }

      // Thorim's Invocation discharges only occur during Doom Winds or Ascendance.
      if (!doomWindsActive && !ascendanceActive) {
        return;
      }

      // For ChL, LB, and Tempest casts, look backwards for a triggering cast.
      for (let backwardsIndex = idx - 1; backwardsIndex >= 0; backwardsIndex -= 1) {
        const backwardsEvent = events[backwardsIndex];
        // The triggering cast and discharge typically occur on the same timestamp.
        if (event.timestamp - backwardsEvent.timestamp > EventLinkBuffers.MaelstromWeapon) {
          break;
        }

        if (
          backwardsEvent.type !== EventType.Cast ||
          !HasAbility(backwardsEvent) ||
          !thorimsInvocationTriggerIds.includes(backwardsEvent.ability.guid)
        ) {
          continue;
        }

        fixedEvents.splice(idx, 1);
        fixedEvents.push({
          ...event,
          type: EventType.FreeCast,
          __modified: true,
        });
        break;
      }
    });

    return fixedEvents;
  }
}
