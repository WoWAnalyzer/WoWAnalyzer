import SPELLS from 'common/SPELLS';

import CoreCooldownTracker, { BUILT_IN_SUMMARY_TYPES } from 'Parser/Core/Modules/CooldownTracker';

const debug = false;

class CooldownTracker extends CoreCooldownTracker {
  static cooldownSpells = [
    ...CooldownTracker.cooldownSpells,
    {
      spell: SPELLS.MANA_TEA_TALENT,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
    },
  ];

  castEventSpells = [
    SPELLS.CHI_BURST_HEAL.id,
    SPELLS.REFRESHING_JADE_WIND_HEAL.id,
    SPELLS.SPIRIT_TETHER.id,
    SPELLS.TRANSCENDENCE.id,
    SPELLS.SOOTHING_MIST_CAST.id,
  ];

  // Clean up display of casts during CDs.  For Monks, both Chi Burst and RJW have a cooresponding cast event
  // per heal event.  This prevents some unneeded spam of Cooldown view.
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
