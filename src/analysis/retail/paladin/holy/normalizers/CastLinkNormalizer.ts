import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { ApplyBuffEvent, GetRelatedEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { INSURANCE, INSURANCE_FROM_DIVINE_TOLL } from './EventLinks/EventLinkConstants';
import { HOLY_SHOCK_EVENT_LINKS } from './EventLinks/HolyShockEventLinks';
import { LIGHT_OF_DAWN_EVENT_LINKS } from './EventLinks/LightOfDawnEventLinks';
import { AVENGING_CRUSADER_EVENT_LINKS } from './EventLinks/AvengingCrusaderEventLinks';
import { HERO_TALENT_EVENT_LINKS } from './EventLinks/HeroTalentEventLinks';

const EVENT_LINKS: EventLink[] = [
  ...HOLY_SHOCK_EVENT_LINKS,
  ...LIGHT_OF_DAWN_EVENT_LINKS,
  ...AVENGING_CRUSADER_EVENT_LINKS,
  ...HERO_TALENT_EVENT_LINKS,
];

// tier
export function isInsuranceFromDivineToll(event: HealEvent) {
  const source = GetRelatedEvent(event, INSURANCE);
  if (!source) {
    return false;
  }
  const divineTollApply = GetRelatedEvent<RefreshBuffEvent | ApplyBuffEvent>(
    source,
    INSURANCE_FROM_DIVINE_TOLL,
  );
  if (!divineTollApply) {
    return false;
  }
  return false;
  // return isFromHardcast(remApply) || isFromRapidDiffusion(remApply);
}

class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export default CastLinkNormalizer;
