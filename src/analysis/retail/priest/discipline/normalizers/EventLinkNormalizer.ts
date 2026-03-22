import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import BaseEventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  PENANCE_BOLTS,
  PENANCE_CASTIGATION_ADDITIONAL_BOLTS,
  PENANCE_CHANNEL_DURATION,
  PENANCE_HARSH_DISIPLINE_ADDITIONAL_BOLTS_PER_RANK,
  PENANCE_TWINSIGHT_ADDITIONAL_BOLTS,
} from 'analysis/retail/priest/discipline/constants';
import Combatant from 'parser/core/Combatant';
import { TALENTS_PRIEST } from 'common/TALENTS';

export enum DisciplineEventLinks {
  PENANCE_BOLT = 'penance-bolt',
}

const penanceBoltLink: EventLink = {
  linkRelation: DisciplineEventLinks.PENANCE_BOLT,
  linkingEventId: SPELLS.PENANCE_CAST.id,
  linkingEventType: EventType.Cast,
  referencedEventId: [
    SPELLS.PENANCE_BOLT_DAMAGE.id,
    SPELLS.PENANCE_BOLT_HEAL.id,
    SPELLS.PENANCE_TWINSIGHT_BOLT_DAMAGE.id,
    SPELLS.PENANCE_TWINSIGHT_BOLT_HEAL.id,
  ],
  referencedEventType: [EventType.Damage, EventType.Heal],
  forwardBufferMs: PENANCE_CHANNEL_DURATION,
  anyTarget: true,
  maximumLinks: (combatant: Combatant) =>
    PENANCE_BOLTS +
    (combatant.hasTalent(TALENTS_PRIEST.CASTIGATION_TALENT)
      ? PENANCE_CASTIGATION_ADDITIONAL_BOLTS
      : 0) +
    PENANCE_HARSH_DISIPLINE_ADDITIONAL_BOLTS_PER_RANK[
      combatant.getTalentRank(TALENTS_PRIEST.HARSH_DISCIPLINE_TALENT)
    ] +
    (combatant.hasTalent(TALENTS_PRIEST.TWINSIGHT_TALENT) ? PENANCE_TWINSIGHT_ADDITIONAL_BOLTS : 0),
  reverseLinkRelation: DisciplineEventLinks.PENANCE_BOLT,
};

class EventLinkNormalizer extends BaseEventLinkNormalizer {
  constructor(options: Options) {
    super(options, [penanceBoltLink]);
  }
}

export default EventLinkNormalizer;
