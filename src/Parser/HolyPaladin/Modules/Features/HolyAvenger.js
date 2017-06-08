import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

const HOLY_AVENGER_HASTE_INCREASE = 0.3;
const HOLY_AVENGER_HOLY_SHOCK_HEALING_INCREASE = 0.3;

class HolyAvenger extends Module {
  regularHealing = 0;
  holyShockHealing = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTalent(SPELLS.HOLY_AVENGER_TALENT.id);
    }
  }

  on_byPlayer_heal(event) {
    if (this.owner.selectedCombatant.hasBuff(SPELLS.HOLY_AVENGER_TALENT.id, event.timestamp)) {
      this.regularHealing += (event.amount + (event.absorbed || 0)) * HOLY_AVENGER_HASTE_INCREASE;

      const spellId = event.ability.guid;
      if (spellId === SPELLS.HOLY_SHOCK_HEAL.id) {
        this.holyShockHealing += calculateEffectiveHealing(event, HOLY_AVENGER_HOLY_SHOCK_HEALING_INCREASE);
      }
    }
  }
  on_beacon_heal({ beaconTransferEvent, matchedHeal: healEvent }) {
    if (this.owner.selectedCombatant.hasBuff(SPELLS.HOLY_AVENGER_TALENT.id, healEvent.timestamp)) {
      this.regularHealing += (beaconTransferEvent.amount + (beaconTransferEvent.absorbed || 0)) * 0.3;

      const spellId = healEvent.ability.guid;
      if (spellId === SPELLS.HOLY_SHOCK_HEAL.id) {
        this.holyShockHealing += calculateEffectiveHealing(beaconTransferEvent, HOLY_AVENGER_HOLY_SHOCK_HEALING_INCREASE);
      }
    }
  }
}

export default HolyAvenger;
