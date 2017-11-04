import SPELLS from 'common/SPELLS';

import CoreCooldownThroughputTracker, { BUILT_IN_SUMMARY_TYPES } from 'Parser/Core/Modules/CooldownThroughputTracker';

const debug = false;

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CooldownThroughputTracker.cooldownSpells,
    {
      spell: SPELLS.METAMORPHOSIS_HAVOC_BUFF,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
    {
      spell: SPELLS.CHAOS_BLADES_TALENT,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
  ];

  castEventSpells = [
    SPELLS.CHAOS_BLADES_DAMAGE_MH.id,
    SPELLS.CHAOS_BLADES_DAMAGE_OH.id,
  ];

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (this.castEventSpells.includes(spellId)) {
      debug && console.log('Exiting');
      return;
    }
    super.on_byPlayer_cast(event);
  }
}

export default CooldownThroughputTracker;