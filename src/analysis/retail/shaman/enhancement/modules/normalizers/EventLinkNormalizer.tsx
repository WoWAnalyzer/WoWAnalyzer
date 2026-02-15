import { Options } from 'parser/core/Analyzer';
import BaseEventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { ApplyBuffEvent, EventType, GetRelatedEvent } from 'parser/core/Events';
import { NormalizerOrder } from './constants';
import {
  EnhancementEventLinks,
  EventLinkBuffers,
  STORMSTRIKE_DAMAGE_IDS,
  STORMSTRIKE_SPELL_IDS,
} from '../../constants';
import { SPLINTERED_ELEMENTS_LINK } from 'analysis/retail/shaman/shared/constants';

const thorimsInvocationCastLink: EventLink = {
  linkRelation: EnhancementEventLinks.THORIMS_INVOCATION_LINK,
  linkingEventId: [
    SPELLS.STORMSTRIKE.id,
    SPELLS.WINDSTRIKE_CAST.id,
    TALENTS.CRASH_LIGHTNING_TALENT.id,
  ],
  linkingEventType: EventType.Cast,
  referencedEventId: [
    SPELLS.LIGHTNING_BOLT.id,
    TALENTS.CHAIN_LIGHTNING_TALENT.id,
    SPELLS.TEMPEST_CAST.id,
  ],
  referencedEventType: [EventType.FreeCast],
  forwardBufferMs: EventLinkBuffers.MaelstromWeapon,
  anyTarget: true,
  isActive: (c) => c.hasTalent(TALENTS.THORIMS_INVOCATION_TALENT),
};
const thorimsInvocationDamageLink: EventLink = {
  linkRelation: EnhancementEventLinks.THORIMS_INVOCATION_DAMAGE_LINK,
  linkingEventId: [
    SPELLS.LIGHTNING_BOLT.id,
    TALENTS.CHAIN_LIGHTNING_TALENT.id,
    SPELLS.TEMPEST_CAST.id,
  ],
  linkingEventType: EventType.FreeCast,
  referencedEventId: [
    SPELLS.LIGHTNING_BOLT.id,
    TALENTS.CHAIN_LIGHTNING_TALENT.id,
    SPELLS.TEMPEST_CAST.id,
  ],
  referencedEventType: EventType.Damage,
  forwardBufferMs: EventLinkBuffers.CastDamageBuffer * 2,
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
  isActive: (c) => c.hasTalent(TALENTS.STORMFLURRY_TALENT),
};
const chainLightningDamageLink: EventLink = {
  linkRelation: EnhancementEventLinks.CHAIN_LIGHTNING_LINK,
  linkingEventId: TALENTS.CHAIN_LIGHTNING_TALENT.id,
  linkingEventType: [EventType.Cast, EventType.FreeCast],
  referencedEventId: TALENTS.CHAIN_LIGHTNING_TALENT.id,
  referencedEventType: EventType.Damage,
  forwardBufferMs: EventLinkBuffers.CastDamageBuffer,
  anyTarget: true,
  reverseLinkRelation: EnhancementEventLinks.CHAIN_LIGHTNING_LINK,
};
const tempestDamageLink: EventLink = {
  linkRelation: EnhancementEventLinks.TEMPEST_LINK,
  linkingEventId: SPELLS.TEMPEST_CAST.id,
  linkingEventType: [EventType.Cast, EventType.FreeCast],
  referencedEventId: SPELLS.TEMPEST_CAST.id,
  referencedEventType: EventType.Damage,
  forwardBufferMs: EventLinkBuffers.CastDamageBuffer,
  anyTarget: true,
  isActive: (c) => c.hasTalent(TALENTS.TEMPEST_TALENT),
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
const surgingElementsBuffLink: EventLink = {
  linkRelation: SPLINTERED_ELEMENTS_LINK,
  linkingEventId: SPELLS.SURGING_ELEMENTS_BUFF.id,
  linkingEventType: EventType.ApplyBuff,
  referencedEventId: TALENTS.SUNDERING_TALENT.id,
  referencedEventType: EventType.Cast,
  forwardBufferMs: 0,
  backwardBufferMs: EventLinkBuffers.SURGING_ELEMENTS_BUFFER,
  anyTarget: true,
  isActive: (c) => c.hasTalent(TALENTS.SURGING_ELEMENTS_TALENT),
  reverseLinkRelation: SPLINTERED_ELEMENTS_LINK,
};
const reactivityLink: EventLink = {
  linkRelation: EnhancementEventLinks.REACTIVITY_LINK,
  linkingEventId: TALENTS.LAVA_LASH_TALENT.id,
  linkingEventType: EventType.Cast,
  referencedEventId: SPELLS.SUNDERING_EARTHSURGE.id,
  referencedEventType: EventType.Cast,
  forwardBufferMs: EventLinkBuffers.CastDamageBuffer,
  backwardBufferMs: 5,
  anyTarget: true,
};
const sunderingDamageLink: EventLink = {
  linkRelation: EnhancementEventLinks.SUNDERING_LINK,
  linkingEventId: [TALENTS.SUNDERING_TALENT.id, SPELLS.SUNDERING_EARTHSURGE.id],
  linkingEventType: EventType.Cast,
  referencedEventId: [TALENTS.SUNDERING_TALENT.id, SPELLS.SUNDERING_EARTHSURGE.id],
  referencedEventType: EventType.Damage,
  forwardBufferMs: EventLinkBuffers.CastDamageBuffer,
  anyTarget: true,
  isActive: (c) => c.hasTalent(TALENTS.EARTHSURGE_TALENT) || c.hasTalent(TALENTS.SUNDERING_TALENT),
};
const whirlingFireHotHandLink: EventLink = {
  linkRelation: EnhancementEventLinks.WHIRLING_FIRE_LINK,
  linkingEventId: SPELLS.HOT_HAND_BUFF.id,
  linkingEventType: EventType.ApplyBuff,
  referencedEventId: SPELLS.WHIRLING_FIRE.id,
  referencedEventType: EventType.RemoveBuff,
  reverseLinkRelation: EnhancementEventLinks.WHIRLING_FIRE_LINK,
  forwardBufferMs: 5,
};
const whirlingFireLavaLashLink: EventLink = {
  linkRelation: EnhancementEventLinks.WHIRLING_FIRE_LINK,
  linkingEventId: SPELLS.WHIRLING_FIRE.id,
  linkingEventType: EventType.RemoveBuff,
  referencedEventId: TALENTS.LAVA_LASH_TALENT.id,
  referencedEventType: EventType.Cast,
  backwardBufferMs: EventLinkBuffers.CastDamageBuffer,
  anyTarget: true,
  additionalCondition: (le, _) => {
    if (le.type === EventType.RemoveBuff && le.ability.guid === SPELLS.WHIRLING_FIRE.id) {
      return (
        GetRelatedEvent<ApplyBuffEvent>(
          le,
          EnhancementEventLinks.WHIRLING_FIRE_LINK,
          (e) => e.type === EventType.ApplyBuff && e.ability.guid === SPELLS.HOT_HAND_BUFF.id,
        ) !== undefined
      );
    }
    return false;
  },
};
const stormUnleashedConsumeLink: EventLink = {
  linkRelation: EnhancementEventLinks.STORM_UNLEASHED_LINK,
  linkingEventId: TALENTS.CRASH_LIGHTNING_TALENT.id,
  linkingEventType: EventType.Cast,
  referencedEventId: SPELLS.STORM_UNLEASHED_BUFF.id,
  referencedEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
  forwardBufferMs: EventLinkBuffers.StormUnleashed,
  anyTarget: true,
  reverseLinkRelation: EnhancementEventLinks.STORM_UNLEASHED_LINK,
  isActive: (c) => c.hasTalent(TALENTS.STORM_UNLEASHED_1_ENHANCEMENT_TALENT),
};

class EventLinkNormalizer extends BaseEventLinkNormalizer {
  constructor(options: Options) {
    super(options, [
      thorimsInvocationCastLink,
      thorimsInvocationDamageLink,
      stormStrikeLink,
      chainLightningDamageLink,
      tempestDamageLink,
      lightningBoltLink,
      surgingElementsBuffLink,
      reactivityLink,
      sunderingDamageLink,
      whirlingFireHotHandLink,
      whirlingFireLavaLashLink,
      stormUnleashedConsumeLink,
    ]);

    this.priority = NormalizerOrder.EventLinkNormalizer;
  }
}

export default EventLinkNormalizer;
