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
import {
  PRIMORDIAL_WAVE_LINK,
  SPLINTERED_ELEMENTS_LINK,
} from 'analysis/retail/shaman/shared/constants';
import { NormalizerOrder } from './constants';

export const MAELSTROM_WEAPON_INSTANT_CAST = 'maelstrom-weapon-instant-cast';
export const THORIMS_INVOCATION_LINK = 'thorims-invocation';
export const STORMSTRIKE_LINK = 'stormstrike';
export const CHAIN_LIGHTNING_LINK = 'chain-lightning';
export const MAELSTROM_SPENDER_LINK = 'maelstrom-spender';
export const LIGHTNING_BOLT_LINK = 'lightning-bolt';
export const MAELSTROM_GENERATOR_LINK = 'maelstrom-generator';

const MAELSTROM_WEAPON_ELIGIBLE_SPELL_IDS = MAELSTROM_WEAPON_ELIGIBLE_SPELLS.map(
  (spell) => spell.id,
);
const stormStrikeSpellIds = STORMSTRIKE_CAST_SPELLS.map((spell) => spell.id);
const stormStrikeDamageIds = STORMSTRIKE_DAMAGE_SPELLS.map((spell) => spell.id);

const PRIMORDIAL_WAVE_BUFFER = 15500;
const MAELSTROM_SPENDER_FORWARD_BUFFER = 25;
const MAELSTROM_SPENDER_BACKWARD_BUFFER = 50;
const STORMSTRIKE_BUFFER = 900;
const CHAIN_LIGHTNING_BUFFER = 100;
const SPLINTERED_ELEMENTS_BUFFER = 20;
const LIGHTNING_BOLT_BUFFER = 150;

const maelstromWeaponInstantCastLink: EventLink = {
  linkRelation: MAELSTROM_WEAPON_INSTANT_CAST,
  linkingEventId: MAELSTROM_WEAPON_ELIGIBLE_SPELL_IDS,
  linkingEventType: [EventType.BeginCast, EventType.BeginChannel, EventType.EndChannel],
  referencedEventId: MAELSTROM_WEAPON_ELIGIBLE_SPELL_IDS,
  referencedEventType: [EventType.Cast, EventType.FreeCast],
  forwardBufferMs: MAELSTROM_WEAPON_MS,
  backwardBufferMs: MAELSTROM_WEAPON_MS,
  anyTarget: true,
  reverseLinkRelation: MAELSTROM_WEAPON_INSTANT_CAST,
  maximumLinks: 1,
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
  forwardBufferMs: STORMSTRIKE_BUFFER,
  anyTarget: true,
};
const chainLightningDamageLink: EventLink = {
  linkRelation: CHAIN_LIGHTNING_LINK,
  linkingEventId: TALENTS.CHAIN_LIGHTNING_TALENT.id,
  linkingEventType: [EventType.Cast, EventType.FreeCast],
  referencedEventId: TALENTS.CHAIN_LIGHTNING_TALENT.id,
  referencedEventType: EventType.Damage,
  forwardBufferMs: CHAIN_LIGHTNING_BUFFER,
  anyTarget: true,
};
const maelstromWeaponSpenderLink: EventLink = {
  linkRelation: MAELSTROM_SPENDER_LINK,
  linkingEventId: MAELSTROM_WEAPON_ELIGIBLE_SPELL_IDS,
  linkingEventType: [EventType.Cast, EventType.FreeCast],
  referencedEventId: SPELLS.MAELSTROM_WEAPON_BUFF.id,
  referencedEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
  forwardBufferMs: MAELSTROM_SPENDER_FORWARD_BUFFER,
  backwardBufferMs: MAELSTROM_SPENDER_BACKWARD_BUFFER,
  anyTarget: true,
  reverseLinkRelation: MAELSTROM_SPENDER_LINK,
  maximumLinks: 1,
};
const primordialWaveLink: EventLink = {
  linkRelation: PRIMORDIAL_WAVE_LINK,
  linkingEventId: TALENTS.PRIMORDIAL_WAVE_SPEC_TALENT.id,
  linkingEventType: EventType.Cast,
  referencedEventId: SPELLS.LIGHTNING_BOLT.id,
  referencedEventType: EventType.Cast,
  anyTarget: true,
  forwardBufferMs: PRIMORDIAL_WAVE_BUFFER,
  maximumLinks: 1,
  reverseLinkRelation: PRIMORDIAL_WAVE_LINK,
};
const splinteredElements: EventLink = {
  linkRelation: SPLINTERED_ELEMENTS_LINK,
  linkingEventId: SPELLS.SPLINTERED_ELEMENTS_BUFF.id,
  linkingEventType: EventType.ApplyBuff,
  referencedEventId: SPELLS.LIGHTNING_BOLT.id,
  referencedEventType: EventType.Cast,
  anyTarget: true,
  forwardBufferMs: SPLINTERED_ELEMENTS_BUFFER,
  maximumLinks: 1,
};
const lightningBoltLink: EventLink = {
  linkRelation: LIGHTNING_BOLT_LINK,
  linkingEventId: SPELLS.LIGHTNING_BOLT.id,
  linkingEventType: EventType.Cast,
  referencedEventId: SPELLS.LIGHTNING_BOLT.id,
  referencedEventType: EventType.Damage,
  forwardBufferMs: LIGHTNING_BOLT_BUFFER,
  anyTarget: true,
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
      splinteredElements,
      lightningBoltLink,
    ]);

    this.priority = NormalizerOrder.EventLinkNormalizer;
  }
}

export default EventLinkNormalizer;
