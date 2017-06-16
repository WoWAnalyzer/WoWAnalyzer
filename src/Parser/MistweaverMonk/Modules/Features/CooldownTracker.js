import SPELLS from 'common/SPELLS';

import CoreCooldownTracker from 'Parser/Core/Modules/CooldownTracker';

const debug = false;

class CooldownTracker extends CoreCooldownTracker {
  static cooldownSpells = [
    ...CooldownTracker.cooldownSpells,
    SPELLS.MANA_TEA_TALENT,
  ];

  castEventSpells = [
    SPELLS.CHI_BURST_HEAL.id,
    SPELLS.REFRESHING_JADE_WIND_HEAL.id,
    SPELLS.SPIRIT_TETHER.id,
    SPELLS.TRANCENDANCE.id,
    SPELLS.SOOTHING_MIST_CAST.id,
  ];

  // Clean up display of casts during CDs.  For Monks, both Chi Burst and RJW have a cooresponding cast event
  // per heal event.  This prevents some unneeded spam of Cooldown view.
  on_byPlayer_cast(event) {
    for (let i = 0; i < this.castEventSpells.length; i++) {
      if(event.ability.guid === this.castEventSpells[i]) {
        debug && console.log('Exiting');
        return false;
      }
    }
    this.activeCooldowns.forEach((cooldown) => {
      cooldown.events.push(event);
    });
  }

}

export default CooldownTracker;
