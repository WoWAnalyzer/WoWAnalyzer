import EventLinkNormalizer from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import SPELLS from '../spell-list_Monk_Brewmaster.retail';
import { GIFT_OF_THE_OX_SPELL_IDS } from '../constants';

export const { normalizer: ExpelOxOrbsNormalizer, linkHelper: ExpelOxOrbs } =
  EventLinkNormalizer.build({
    linkRelation: 'expel-gotox',
    linkingEventType: EventType.Cast,
    linkingEventId: SPELLS.EXPEL_HARM.id,
    referencedEventId: GIFT_OF_THE_OX_SPELL_IDS,
    referencedEventType: EventType.Heal,
    backwardBufferMs: 50,
    reverseLinkRelation: 'expel-gotox-cast',
    // expel harm cast has no target
    anyTarget: true,
  });
