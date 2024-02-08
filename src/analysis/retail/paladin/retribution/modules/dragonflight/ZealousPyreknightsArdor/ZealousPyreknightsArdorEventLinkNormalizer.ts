import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Analyzer';
import { TIERS } from 'game/TIERS';
import SPELLS from 'common/SPELLS/paladin';
import {
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvents,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { ECHOES_OF_WRATH_DURATION } from 'analysis/retail/paladin/retribution/modules/dragonflight/ZealousPyreknightsArdor/constants';

const WRATHFUL_SANCTION = 'WrathfulSanction';
const WRATHFUL_SANCTION_BUFFER_MS = 1000;

const ECHOES_OF_WRATH_BUFF = 'EchoesOfWrath';
// Use Echoes of Wrath duration plus slightly less than min GCD to account for server lag
const ECHOES_OF_WRATH_BUFF_BUFFER_MS = ECHOES_OF_WRATH_DURATION + 500;

const EVENT_LINKS: EventLink[] = [
  // region 2p
  {
    linkRelation: WRATHFUL_SANCTION,
    referencedEventId: SPELLS.WRATHFUL_SANCTION.id,
    referencedEventType: EventType.Damage,
    linkingEventId: SPELLS.JUDGMENT_CAST.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: WRATHFUL_SANCTION_BUFFER_MS,
    anyTarget: true,
  },
  // endregion

  // region 4p
  {
    linkRelation: ECHOES_OF_WRATH_BUFF,
    reverseLinkRelation: ECHOES_OF_WRATH_BUFF,
    referencedEventId: SPELLS.ECHOES_OF_WRATH.id,
    referencedEventType: EventType.RemoveBuff,
    linkingEventId: SPELLS.ECHOES_OF_WRATH.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    forwardBufferMs: ECHOES_OF_WRATH_BUFF_BUFFER_MS,
    anyTarget: true,
  },
  // endregion
];

export default class ZealousPyreknightsArdorEventLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.T31);
  }
}

export const getWrathfulSanctionDamageEventsFromCast = (event: CastEvent): DamageEvent[] =>
  GetRelatedEvents(event, WRATHFUL_SANCTION).filter(
    (it): it is DamageEvent => it.type === EventType.Damage,
  );

export const getEchoesOfWrathRemovalFromApplication = (
  event: ApplyBuffEvent | RefreshBuffEvent,
): RemoveBuffEvent | undefined =>
  GetRelatedEvents(event, ECHOES_OF_WRATH_BUFF)
    .filter((it): it is RemoveBuffEvent => it.type === EventType.RemoveBuff)
    .at(0);
