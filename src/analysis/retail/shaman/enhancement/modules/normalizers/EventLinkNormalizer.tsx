import { Options } from 'parser/core/Analyzer';
import BaseEventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { EventType } from 'parser/core/Events';
import {
  PRIMORDIAL_WAVE_LINK,
  SPLINTERED_ELEMENTS_LINK,
} from 'analysis/retail/shaman/shared/constants';
import { NormalizerOrder } from './constants';
import {
  EnhancementEventLinks,
  EventLinkBuffers,
  STORMSTRIKE_DAMAGE_IDS,
  STORMSTRIKE_SPELL_IDS,
} from '../../constants';

const thorimsInvocationCastLink: EventLink = {
  linkRelation: EnhancementEventLinks.THORIMS_INVOCATION_LINK,
  linkingEventId: SPELLS.WINDSTRIKE_CAST.id,
  linkingEventType: EventType.Cast,
  referencedEventId: [
    SPELLS.LIGHTNING_BOLT.id,
    TALENTS.CHAIN_LIGHTNING_TALENT.id,
    SPELLS.TEMPEST_CAST.id,
  ],
  referencedEventType: [EventType.Damage],
  forwardBufferMs: EventLinkBuffers.MaelstromWeapon,
  anyTarget: true,
};
const stormStrikeLink: EventLink = {
  linkRelation: EnhancementEventLinks.STORMSTRIKE_LINK,
  linkingEventId: STORMSTRIKE_SPELL_IDS,
  linkingEventType: EventType.Cast,
  referencedEventId: STORMSTRIKE_DAMAGE_IDS,
  referencedEventType: EventType.Damage,
  forwardBufferMs: EventLinkBuffers.Stormstrike,
  anyTarget: true,
};
const chainLightningDamageLink: EventLink = {
  linkRelation: EnhancementEventLinks.CHAIN_LIGHTNING_LINK,
  linkingEventId: TALENTS.CHAIN_LIGHTNING_TALENT.id,
  linkingEventType: [EventType.Cast, EventType.FreeCast],
  referencedEventId: TALENTS.CHAIN_LIGHTNING_TALENT.id,
  referencedEventType: EventType.Damage,
  forwardBufferMs: EventLinkBuffers.CAST_DAMAGE_BUFFER,
  anyTarget: true,
};
const tempestDamageLink: EventLink = {
  linkRelation: EnhancementEventLinks.TEMPEST_LINK,
  linkingEventId: SPELLS.TEMPEST_CAST.id,
  linkingEventType: [EventType.Cast, EventType.FreeCast],
  referencedEventId: SPELLS.TEMPEST_CAST.id,
  referencedEventType: EventType.Damage,
  forwardBufferMs: EventLinkBuffers.CAST_DAMAGE_BUFFER,
  anyTarget: true,
};
const primordialWaveLink: EventLink = {
  linkRelation: PRIMORDIAL_WAVE_LINK,
  linkingEventId: TALENTS.PRIMORDIAL_WAVE_SPEC_TALENT.id,
  linkingEventType: EventType.Cast,
  referencedEventId: SPELLS.LIGHTNING_BOLT.id,
  referencedEventType: EventType.Cast,
  anyTarget: true,
  forwardBufferMs: EventLinkBuffers.PrimordialWave,
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
  forwardBufferMs: EventLinkBuffers.SPLINTERED_ELEMENTS_BUFFER,
  maximumLinks: 1,
};
const lightningBoltLink: EventLink = {
  linkRelation: EnhancementEventLinks.LIGHTNING_BOLT_LINK,
  linkingEventId: SPELLS.LIGHTNING_BOLT.id,
  linkingEventType: EventType.Cast,
  referencedEventId: SPELLS.LIGHTNING_BOLT.id,
  referencedEventType: EventType.Damage,
  forwardBufferMs: EventLinkBuffers.LIGHTNING_BOLT_BUFFER,
  anyTarget: true,
};

class EventLinkNormalizer extends BaseEventLinkNormalizer {
  constructor(options: Options) {
    super(options, [
      thorimsInvocationCastLink,
      stormStrikeLink,
      chainLightningDamageLink,
      tempestDamageLink,
      primordialWaveLink,
      splinteredElements,
      lightningBoltLink,
    ]);

    this.priority = NormalizerOrder.EventLinkNormalizer;
  }
}

export default EventLinkNormalizer;
