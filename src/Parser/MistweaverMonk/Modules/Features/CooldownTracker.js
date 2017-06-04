import SPELLS from 'common/SPELLS';

import CoreCooldownTracker from 'Parser/Core/Modules/CooldownTracker';

class CooldownTracker extends CoreCooldownTracker {
  static cooldownSpells = [
    ...CooldownTracker.cooldownSpells,
    SPELLS.MANA_TEA_TALENT,
  ];

  // Clean up display of casts during CDs.  For Monks, both Chi Burst and RJW have a cooresponding cast event
  // per heal event.  This prevents some unneeded spam of Cooldown view.
  on_byPlayer_cast(event) {
    if(event.type === 'cast' && event.ability.guid === SPELLS.CHI_BURST_HEAL.id) {
      return;
    }
    if(event.type === 'cast' && event.ability.guid === SPELLS.REFRESHING_JADE_WIND_HEAL.id) {
      return;
    }
    this.activeCooldowns.forEach((cooldown) => {
      cooldown.events.push(event);
    });
  }

}

export default CooldownTracker;
