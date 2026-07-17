import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
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

class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export default CastLinkNormalizer;
