import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';

export const DEATH_STRIKE_HEAL = 'death-strike-heal';
export const DEATH_STRIKE_ABSORB_GEN = 'death-strike-absorb';

const healLink: EventLink = {
  linkRelation: DEATH_STRIKE_HEAL,
  linkingEventType: EventType.Cast,
  linkingEventId: talents.DEATH_STRIKE_TALENT.id,
  referencedEventType: EventType.Heal,
  referencedEventId: SPELLS.DEATH_STRIKE_HEAL.id,
  anyTarget: true,
  // generally this occurs at the same timestamp, but could be before or after.
  backwardBufferMs: 100,
  forwardBufferMs: 100,
  maximumLinks: 1,
};

const absorbBuffLink: EventLink = {
  linkRelation: DEATH_STRIKE_ABSORB_GEN,
  linkingEventType: EventType.Cast,
  linkingEventId: talents.DEATH_STRIKE_TALENT.id,
  referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
  referencedEventId: SPELLS.BLOOD_SHIELD.id,
  // generally this occurs at the same timestamp, but could be before or after.
  backwardBufferMs: 100,
  forwardBufferMs: 100,
  anyTarget: true,
  maximumLinks: 1,
};

export default class DeathStrikeLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, [healLink, absorbBuffLink]);
  }
}
