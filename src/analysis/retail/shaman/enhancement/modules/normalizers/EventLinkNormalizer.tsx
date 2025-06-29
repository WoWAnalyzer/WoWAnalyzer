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
  isActive: (c) => c.hasTalent(TALENTS.THORIMS_INVOCATION_TALENT),
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
  forwardBufferMs: EventLinkBuffers.CAST_DAMAGE_BUFFER,
  anyTarget: true,
  reverseLinkRelation: EnhancementEventLinks.CHAIN_LIGHTNING_LINK,
};
const crashLightningDamageLink: EventLink = {
  linkRelation: EnhancementEventLinks.CRASH_LIGHTNING_LINK,
  linkingEventId: TALENTS.CRASH_LIGHTNING_TALENT.id,
  linkingEventType: EventType.Cast,
  referencedEventId: TALENTS.CRASH_LIGHTNING_TALENT.id,
  referencedEventType: EventType.Damage,
  forwardBufferMs: EventLinkBuffers.CAST_DAMAGE_BUFFER,
  anyTarget: true,
  isActive: (c) => c.hasTalent(TALENTS.UNRELENTING_STORMS_TALENT),
};
const tempestDamageLink: EventLink = {
  linkRelation: EnhancementEventLinks.TEMPEST_LINK,
  linkingEventId: SPELLS.TEMPEST_CAST.id,
  linkingEventType: [EventType.Cast, EventType.FreeCast],
  referencedEventId: SPELLS.TEMPEST_CAST.id,
  referencedEventType: EventType.Damage,
  forwardBufferMs: EventLinkBuffers.CAST_DAMAGE_BUFFER,
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
const splinteredElementsBuffLink: EventLink = {
  linkRelation: SPLINTERED_ELEMENTS_LINK,
  linkingEventId: SPELLS.SPLINTERED_ELEMENTS_BUFF.id,
  linkingEventType: EventType.ApplyBuff,
  referencedEventId: TALENTS.PRIMORDIAL_WAVE_TALENT.id,
  referencedEventType: EventType.Cast,
  forwardBufferMs: 0,
  backwardBufferMs: EventLinkBuffers.SPLINTERED_ELEMENTS_BUFFER,
  anyTarget: true,
  isActive: (c) => c.hasTalent(TALENTS.SPLINTERED_ELEMENTS_TALENT),
  reverseLinkRelation: SPLINTERED_ELEMENTS_LINK,
};
const splinteredElementsDamageLink: EventLink = {
  linkRelation: SPLINTERED_ELEMENTS_LINK,
  linkingEventId: TALENTS.PRIMORDIAL_WAVE_TALENT.id,
  linkingEventType: EventType.Cast,
  referencedEventId: SPELLS.PRIMORDIAL_WAVE_DAMAGE.id,
  referencedEventType: EventType.Damage,
  forwardBufferMs: EventLinkBuffers.PRIMORDIAL_WAVE_DAMAGE_BUFFER,
  anyTarget: true,
  isActive: (c) => c.hasTalent(TALENTS.SPLINTERED_ELEMENTS_TALENT),
  reverseLinkRelation: SPLINTERED_ELEMENTS_LINK,
};
const reactivityLink: EventLink = {
  linkRelation: EnhancementEventLinks.REACTIVITY_LINK,
  linkingEventId: TALENTS.LAVA_LASH_TALENT.id,
  linkingEventType: EventType.Cast,
  referencedEventId: SPELLS.SUNDERING_REACTIVITY.id,
  referencedEventType: EventType.Cast,
  forwardBufferMs: EventLinkBuffers.CAST_DAMAGE_BUFFER,
  backwardBufferMs: 5,
  anyTarget: true,
};
const sunderingDamageLink: EventLink = {
  linkRelation: EnhancementEventLinks.SUNDERING_LINK,
  linkingEventId: [TALENTS.SUNDERING_TALENT.id, SPELLS.SUNDERING_REACTIVITY.id],
  linkingEventType: EventType.Cast,
  referencedEventId: [TALENTS.SUNDERING_TALENT.id, SPELLS.SUNDERING_REACTIVITY.id],
  referencedEventType: EventType.Damage,
  forwardBufferMs: EventLinkBuffers.CAST_DAMAGE_BUFFER,
  anyTarget: true,
  isActive: (c) => c.hasTalent(TALENTS.REACTIVITY_TALENT) || c.hasTalent(TALENTS.SUNDERING_TALENT),
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
  backwardBufferMs: EventLinkBuffers.CAST_DAMAGE_BUFFER,
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

class EventLinkNormalizer extends BaseEventLinkNormalizer {
  constructor(options: Options) {
    super(options, [
      thorimsInvocationCastLink,
      stormStrikeLink,
      chainLightningDamageLink,
      crashLightningDamageLink,
      tempestDamageLink,
      lightningBoltLink,
      splinteredElementsBuffLink,
      splinteredElementsDamageLink,
      reactivityLink,
      sunderingDamageLink,
      whirlingFireHotHandLink,
      whirlingFireLavaLashLink,
    ]);

    this.priority = NormalizerOrder.EventLinkNormalizer;
  }
}

export default EventLinkNormalizer;
