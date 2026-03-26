import { createEventLinks, link } from 'analysis/retail/mage/shared/helpers/castLinkHelpers';
import { Options } from 'parser/core/Module';
import { EventType, GetRelatedEvent } from 'parser/core/Events';
import EventLinkNormalizer from 'parser/core/EventLinkNormalizer';
import SPELLS from 'common/SPELLS/rogue';

const EVENT_LINKS = createEventLinks({
  spell: SPELLS.SHADOW_DANCE_BUFF.id,
  parentType: EventType.ApplyBuff,
  links: [
    link(EventType.RemoveBuff, { forwardBuffer: 15000, maxLinks: 1, anyTarget: true }),
    {
      relation: EventType.Damage,
      type: EventType.Damage,
      id: [
        // Builders
        SPELLS.SHADOWSTRIKE.id,
        SPELLS.SHURIKEN_STORM.id,
        // Big Finishers
        SPELLS.SECRET_TECHNIQUE.id,
        SPELLS.SECRET_TECHNIQUE_DAMAGE.id,
        SPELLS.COUP_DE_GRACE_DAMAGE.id,
        // Black Powder
        SPELLS.BLACK_POWDER.id,
        SPELLS.BLACK_POWDER_SHADOW.id,
        SPELLS.BLACK_POWDER_ANCIENT_ARTS_DAMAGE.id,
        // Eviscerate
        SPELLS.EVISCERATE.id,
        SPELLS.EVISCERATE_SHADOWED_FINISHERS_DAMAGE.id,
        SPELLS.EVISCERATE_ANCIENT_ARTS_DAMAGE.id,
        SPELLS.EVISCERATE_COUP_DE_GRACE_DAMAGE.id,
        SPELLS.EVISCERATE_COUP_DE_GRACE_2_DAMAGE.id,
        SPELLS.EVISCERATE_COUP_DE_GRACE_3_DAMAGE.id,
        SPELLS.EVISCERATE_COUP_DE_GRACE_4_DAMAGE.id,
        SPELLS.EVISCERATE_COUP_DE_GRACE_5_DAMAGE.id,
        SPELLS.EVISCERATE_COUP_DE_GRACE_6_DAMAGE.id,
        1, // Melee damage
        // Pasives
        SPELLS.LASHE_MACABRE_DAMAGE.id,
        SPELLS.SHADOW_BLADES_DAMAGE.id,
        SPELLS.UNSEEN_BLADE_DAMAGE.id,
        SPELLS.NIMBLE_FURY_DAMAGE.id,
      ],
      anyTarget: true,
      forwardBuffer: 15000,
      condition: (linkingEvent, referencedEvent) => {
        const debuffEnd = GetRelatedEvent(linkingEvent, EventType.RemoveBuff);
        return debuffEnd ? referencedEvent.timestamp < debuffEnd.timestamp : false;
      },
    },
  ],
});

/**
 * Links the damage events for spells to their cast event. This allows for more
 * easily accessing the related events in spec modules instead of looking at the
 * events separately.
 */
class SubletyNormalizer extends EventLinkNormalizer {
  combatant = this.owner.selectedCombatant;
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export default SubletyNormalizer;
