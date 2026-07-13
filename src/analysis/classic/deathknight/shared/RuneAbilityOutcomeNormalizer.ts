import SPELLS from 'common/SPELLS/classic/deathknight';
import EventLinkNormalizer from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';

/**
 * Rune-costing abilities that roll a real melee/spell attack against a
 * single target, and can therefore miss, get dodged, or get parried. In the
 * real game, a refundable rune ability that doesn't land
 * never actually spends its rune(s) at all (only ~10% Runic Power is
 * affected, which this tracker doesn't model).
 *
 * Deliberately excluded:
 *  - Blood Boil / Death and Decay: PBAoE effects that always find their
 *    targets rather than rolling a single hit/miss outcome, so there's no
 *    single damage event whose hitType would represent "the ability didn't
 *    land" the way there is for a single-target strike.
 *  - Army of the Dead: summons a ghoul, no attack roll at all.
 *  - Chains of Ice / Pillar of Frost: pure utility/self-buff casts.
 * If evidence turns up that any of these should be refundable too, add them
 * here - the rest of the wiring (the normalizer and MoPRuneTracker's check)
 * doesn't care which spells are in this list.
 */
export const REFUNDABLE_RUNE_SPELLS: number[] = [
  SPELLS.ICY_TOUCH.id,
  SPELLS.PLAGUE_STRIKE.id,
  SPELLS.DEATH_STRIKE.id,
  SPELLS.BLOOD_STRIKE.id,
  SPELLS.OBLITERATE.id,
  SPELLS.FESTERING_STRIKE.id,
  SPELLS.SCOURGE_STRIKE.id,
  SPELLS.NECROTIC_STRIKE.id,
  SPELLS.SOUL_REAPER_FROST.id,
  SPELLS.SOUL_REAPER_UNHOLY.id,
  SPELLS.SOUL_REAPER_BLOOD.id,
  // Blood's signature Blood-rune spender - no BloodRuneTracker is registered
  // yet, but this entry is harmless (and correct) to have ready in the
  // meantime since it only ever matters once something actually spends
  // Heart Strike's rune cost (see MoPRuneTracker's cost table).
  SPELLS.HEART_STRIKE.id,
];

/**
 * Links each refundable rune ability's cast to the damage event it produced,
 * so MoPRuneTracker can read that event's `hitType` synchronously when the
 * cast event is processed (rather than needing to buffer the spend decision
 * until a later event comes in). WCL normally emits the damage event at the
 * same timestamp as the cast, but a generous forward buffer is used to
 * tolerate any latency between the two in the log.
 */
export const { normalizer: RuneAbilityOutcomeNormalizer, linkHelper: runeAbilityOutcome } =
  EventLinkNormalizer.build({
    linkRelation: 'RuneAbilityOutcome',
    linkingEventId: REFUNDABLE_RUNE_SPELLS,
    linkingEventType: EventType.Cast,
    referencedEventId: REFUNDABLE_RUNE_SPELLS,
    referencedEventType: EventType.Damage,
    forwardBufferMs: 500,
    maximumLinks: 1,
  });
