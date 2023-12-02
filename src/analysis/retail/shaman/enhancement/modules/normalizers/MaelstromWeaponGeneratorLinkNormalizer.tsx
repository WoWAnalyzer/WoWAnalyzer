import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import { EventType } from 'parser/core/Events';
import Combatant from 'parser/core/Combatant';

const MAELSTROM_GENERATOR_LINK = 'maelstrom-generator';

/**
 * This normalizer links eligible maelstrom generators to the maelstrom weapon buff
 * 'applybuff', 'applybuffstack', and 'refreshbuff' events. This normalizer has a lower
 * priority than {@link MaelstromWeaponBuffNormalizer}, and relies on the redundant
 * 'refreshbuff' events being removed
 */
class MaelstromWeaponGeneratorLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, [primordialWave, iceStrike, frostShock, otherGenerator]);

    this.priority = -90;
  }
}

const linkTemplate = {
  linkRelation: MAELSTROM_GENERATOR_LINK,
  linkingEventType: EventType.Cast,
  referencedEventId: SPELLS.MAELSTROM_WEAPON_BUFF.id,
  referencedEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack, EventType.RefreshBuff],
  anyTarget: true,
  reverseLinkRelation: MAELSTROM_GENERATOR_LINK,
};

/**
 * primordial wave can generate up to 10 maelstrom, events are always prior to cast
 */
const primordialWave: EventLink = {
  ...linkTemplate,
  linkingEventId: TALENTS.PRIMORDIAL_WAVE_SPEC_TALENT.id,
  backwardBufferMs: 25,
  anySource: false,
  maximumLinks: (c) => c.getTalentRank(TALENTS.PRIMAL_MAELSTROM_TALENT) * 5,
};

const iceStrike: EventLink = {
  ...linkTemplate,
  linkingEventId: TALENTS.ICE_STRIKE_TALENT.id,
  forwardBufferMs: 25,
  maximumLinks: (c: Combatant) => {
    let max = 0;
    if (c.hasTalent(TALENTS.ELEMENTAL_ASSAULT_TALENT)) {
      max += 1;
    }
    if (c.hasTalent(TALENTS.SWIRLING_MAELSTROM_TALENT)) {
      max += 1;
    }
    return max;
  },
};

const frostShock: EventLink = {
  ...linkTemplate,
  linkingEventId: TALENTS.FROST_SHOCK_TALENT.id,
  forwardBufferMs: 25,
  anySource: false,
  maximumLinks: (c) => (c.hasTalent(TALENTS.SWIRLING_MAELSTROM_TALENT) ? 1 : 0),
};

const otherGenerator: EventLink = {
  ...linkTemplate,
  linkingEventId: [
    TALENTS.LAVA_LASH_TALENT.id,
    TALENTS.STORMSTRIKE_TALENT.id,
    SPELLS.WINDSTRIKE_CAST.id,
  ],
  forwardBufferMs: 25,
  anySource: false,
  maximumLinks: 1,
};

export default MaelstromWeaponGeneratorLinkNormalizer;
