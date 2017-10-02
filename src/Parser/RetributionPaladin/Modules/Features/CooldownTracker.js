import SPELLS from 'common/SPELLS';
import CoreCooldownTracker, { BUILT_IN_SUMMARY_TYPES } from 'Parser/Core/Modules/CooldownTracker';

const debug = false;

class CooldownTracker extends CoreCooldownTracker {
  static cooldownSpells = [
    ...CooldownTracker.cooldownSpells,
    {
      spell: SPELLS.AVENGING_WRATH,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
    {
      spell: SPELLS.CRUSADE_TALENT,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
  ];

  castEventSpells = [
    SPELLS.DIVINE_HAMMER_HIT.id,
  ];

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (this.castEventSpells.indexOf(spellId) !== -1) {
      debug && console.log('Exiting');
      return;
    }
    super.on_byPlayer_cast(event);
  }
}

export default CooldownTracker;