import { Options } from 'parser/core/Analyzer';
import BaseEventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { EventType } from 'parser/core/Events';
import {
  MAELSTROM_WEAPON_ELIGIBLE_SPELLS,
  MAELSTROM_WEAPON_MS,
  STORMSTRIKE_CAST_SPELLS,
  STORMSTRIKE_DAMAGE_SPELLS,
} from '../../constants';

export const MAELSTROM_WEAPON_INSTANT_CAST = 'maelstrom-weapon-instant-cast';
export const THORIMS_INVOCATION_LINK = 'thorims-invocation';
export const PRIMORDIAL_WAVE_FREE_LIGHTNING_BOLTS = 'primordial-wave-auto-cast';
export const STORMSTRIKE_LINK = 'stormstrike';
export const CHAIN_LIGHTNING_LINK = 'chain-lightning';

const MAELSTROM_WEAPON_ELIGIBLE_SPELL_IDS = MAELSTROM_WEAPON_ELIGIBLE_SPELLS.map(
  (spell) => spell.id,
);
const stormStrikeSpellIds = STORMSTRIKE_CAST_SPELLS.map((spell) => spell.id);
const stormStrikeDamageIds = STORMSTRIKE_DAMAGE_SPELLS.map((spell) => spell.id);

const maelstromWeaponInstantCastLink: EventLink = {
  linkRelation: MAELSTROM_WEAPON_INSTANT_CAST,
  linkingEventId: MAELSTROM_WEAPON_ELIGIBLE_SPELL_IDS,
  linkingEventType: [
    EventType.BeginCast,
    EventType.BeginChannel,
    EventType.Cast,
    EventType.FreeCast,
    EventType.EndChannel,
  ],
  referencedEventId: MAELSTROM_WEAPON_ELIGIBLE_SPELL_IDS,
  referencedEventType: [
    EventType.BeginCast,
    EventType.BeginChannel,
    EventType.Cast,
    EventType.FreeCast,
    EventType.EndChannel,
  ],
  forwardBufferMs: MAELSTROM_WEAPON_MS,
  backwardBufferMs: MAELSTROM_WEAPON_MS,
  anyTarget: true,
};

const thorimsInvocationCastLink: EventLink = {
  linkRelation: THORIMS_INVOCATION_LINK,
  linkingEventId: SPELLS.WINDSTRIKE_CAST.id,
  linkingEventType: EventType.Cast,
  referencedEventId: [SPELLS.LIGHTNING_BOLT.id, TALENTS.CHAIN_LIGHTNING_TALENT.id],
  referencedEventType: [EventType.Damage],
  forwardBufferMs: MAELSTROM_WEAPON_MS,
  anyTarget: true,
};

const stormStrikeLink: EventLink = {
  linkRelation: STORMSTRIKE_LINK,
  linkingEventId: stormStrikeSpellIds,
  linkingEventType: EventType.Cast,
  referencedEventId: stormStrikeDamageIds,
  referencedEventType: EventType.Damage,
  forwardBufferMs: 900,
  anyTarget: true,
};

const chainLightningDamageLink: EventLink = {
  linkRelation: CHAIN_LIGHTNING_LINK,
  linkingEventId: TALENTS.CHAIN_LIGHTNING_TALENT.id,
  linkingEventType: [EventType.Cast, EventType.FreeCast],
  referencedEventId: TALENTS.CHAIN_LIGHTNING_TALENT.id,
  referencedEventType: EventType.Damage,
  forwardBufferMs: 100,
  anyTarget: true,
};

class EventLinkNormalizer extends BaseEventLinkNormalizer {
  constructor(options: Options) {
    super(options, [
      maelstromWeaponInstantCastLink,
      thorimsInvocationCastLink,
      stormStrikeLink,
      chainLightningDamageLink,
    ]);
  }
}

export default EventLinkNormalizer;
