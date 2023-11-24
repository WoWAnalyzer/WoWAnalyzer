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
export const STORMSTRIKE_LINK = 'stormstrike';
export const CHAIN_LIGHTNING_LINK = 'chain-lightning';
export const MAELSTROM_WEAPON_SPEND_LINK = 'maelstrom-spender';
export const PRIMORIDAL_WAVE_END_LINK = 'primordial-wave-end';
export const LIGHTNING_BOLT_PRIMORDIAL_WAVE_LINK = 'lightning-bolt-primoridal-wave';
export const MAELSTROM_GENERATOR_LINK = 'maelstrom-generator';

const MAELSTROM_WEAPON_ELIGIBLE_SPELL_IDS = MAELSTROM_WEAPON_ELIGIBLE_SPELLS.map(
  (spell) => spell.id,
);
const stormStrikeSpellIds = STORMSTRIKE_CAST_SPELLS.map((spell) => spell.id);
const stormStrikeDamageIds = STORMSTRIKE_DAMAGE_SPELLS.map((spell) => spell.id);

const maelstromWeaponInstantCastLink: EventLink = {
  linkRelation: MAELSTROM_WEAPON_INSTANT_CAST,
  linkingEventId: MAELSTROM_WEAPON_ELIGIBLE_SPELL_IDS,
  linkingEventType: [EventType.BeginCast, EventType.BeginChannel, EventType.EndChannel],
  referencedEventId: MAELSTROM_WEAPON_ELIGIBLE_SPELL_IDS,
  referencedEventType: [EventType.Cast, EventType.FreeCast],
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

const maelstromWeaponSpenderLink: EventLink = {
  linkRelation: MAELSTROM_WEAPON_SPEND_LINK,
  linkingEventId: SPELLS.MAELSTROM_WEAPON_BUFF.id,
  linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
  referencedEventId: MAELSTROM_WEAPON_ELIGIBLE_SPELL_IDS,
  referencedEventType: [EventType.Cast, EventType.FreeCast],
  backwardBufferMs: 25,
  anyTarget: true,
};

const primordialWaveLink: EventLink = {
  linkRelation: PRIMORIDAL_WAVE_END_LINK,
  linkingEventId: SPELLS.PRIMORDIAL_WAVE_BUFF.id,
  linkingEventType: EventType.RemoveBuff,
  referencedEventId: SPELLS.LIGHTNING_BOLT.id,
  referencedEventType: EventType.Cast,
  backwardBufferMs: 50,
  forwardBufferMs: 50,
  anyTarget: true,
};

const lightningBoltDamageLink: EventLink = {
  linkRelation: LIGHTNING_BOLT_PRIMORDIAL_WAVE_LINK,
  linkingEventId: SPELLS.LIGHTNING_BOLT.id,
  linkingEventType: EventType.Cast,
  referencedEventId: SPELLS.LIGHTNING_BOLT.id,
  referencedEventType: EventType.Damage,
  forwardBufferMs: 50,
  anyTarget: true,
};

const maelstromGeneratorLink: EventLink = {
  linkRelation: MAELSTROM_GENERATOR_LINK,
  linkingEventId: SPELLS.MAELSTROM_WEAPON_BUFF.id,
  linkingEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack, EventType.RefreshBuff],
  referencedEventId: [
    TALENTS.STORMSTRIKE_TALENT.id,
    TALENTS.LAVA_LASH_TALENT.id,
    TALENTS.ICE_STRIKE_TALENT.id,
    SPELLS.WINDSTRIKE_CAST.id,
    TALENTS.FROST_SHOCK_TALENT.id,
    TALENTS.FIRE_NOVA_TALENT.id,
  ],
  referencedEventType: EventType.Cast,
  forwardBufferMs: 5,
  backwardBufferMs: 5,
  anyTarget: true,
  maximumLinks: 1,
};

class EventLinkNormalizer extends BaseEventLinkNormalizer {
  constructor(options: Options) {
    super(options, [
      maelstromWeaponInstantCastLink,
      thorimsInvocationCastLink,
      stormStrikeLink,
      chainLightningDamageLink,
      maelstromWeaponSpenderLink,
      primordialWaveLink,
      lightningBoltDamageLink,
      maelstromGeneratorLink,
    ]);
  }
}

export default EventLinkNormalizer;
