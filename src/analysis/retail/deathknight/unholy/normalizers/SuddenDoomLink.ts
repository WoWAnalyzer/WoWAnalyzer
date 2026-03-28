import EventLinkNormalizer from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import DK_SPELLS from 'common/SPELLS/deathknight';

const SD_CONSUMERS = [
  SPELLS.DEATH_COIL.id,
  SPELLS.EPIDEMIC.id,
  DK_SPELLS.NECROTIC_COIL.id,
  DK_SPELLS.GRAVEYARD.id,
];

/**
 * Links Sudden Doom removebuff events to their consuming cast events.
 * WCL can order removebuff before cast at the same timestamp, making
 * flag-based consumption detection unreliable. This normalizer links
 * them so the analyzer can check for a linked cast instead.
 */
export const { normalizer: SuddenDoomLinkNormalizer, linkHelper: SuddenDoomConsumption } =
  EventLinkNormalizer.build({
    linkRelation: 'sudden-doom-consumption',
    linkingEventType: EventType.RemoveBuff,
    linkingEventId: SPELLS.SUDDEN_DOOM_BUFF.id,
    referencedEventId: SD_CONSUMERS,
    referencedEventType: EventType.Cast,
    backwardBufferMs: 500,
    forwardBufferMs: 500,
    anyTarget: true,
    maximumLinks: 1,
    reverseLinkRelation: 'sudden-doom-consumed-buff',
  });
