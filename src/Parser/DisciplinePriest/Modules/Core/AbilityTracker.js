import SPELLS from 'common/SPELLS';

import CoreAbilityTracker from 'Parser/Core/Modules/AbilityTracker';

/** The amount of time during which it's impossible a second Penance could have started */
const PENANCE_CHANNEL_TIME_BUFFER = 2500;

const debug = false;

class AbilityTracker extends CoreAbilityTracker {
  getAbility(spellId, abilityInfo = null) {
    if (spellId === SPELLS.SHADOWFIEND_WITH_GLYPH_OF_THE_SHA.id) {
      return super.getAbility(SPELLS.SHADOWFIEND.id, abilityInfo);
    }
    return super.getAbility(spellId, abilityInfo);
  }

  on_byPlayer_cast(event) {
    if (super.on_byPlayer_cast) {
      super.on_byPlayer_cast(event);
    }
    const spellId = event.ability.guid;
    const cast = this.getAbility(spellId, event.ability);

    if (spellId === SPELLS.POWER_WORD_SHIELD.id) {
      const hasRapture = this.owner.selectedCombatant.hasBuff(SPELLS.RAPTURE.id, event.timestamp);

      if (hasRapture) {
        cast.raptureCasts = (cast.raptureCasts || 0) + 1;
      }
    }
  }

  lastPenanceStartTimestamp = null;
  getHardcodedManaCost(event) {
    const spellId = event.ability.guid;
    let hardcodedCost = super.getHardcodedManaCost(event);
    // Penance does not include the mana cost in the spellId :(
    if (spellId === SPELLS.PENANCE.id) {
      if (!this.lastPenanceStartTimestamp || (event.timestamp - this.lastPenanceStartTimestamp) > PENANCE_CHANNEL_TIME_BUFFER) {
        this.lastPenanceStartTimestamp = event.timestamp;
        hardcodedCost = SPELLS.PENANCE.manaCost;
      } else {
        // This is a second bolt from Penance, it doesn't cost mana.
        hardcodedCost = 0;
      }
    }
    return hardcodedCost;
  }
  getManaCost(event) {
    let cost = super.getManaCost(event);
    if (cost === 0) {
      return cost;
    }

    // Kam Xi'raff reduces the mana cost of damaging spells by 75%
    if (!event.targetIsFriendly && this.owner.selectedCombatant.hasBuff(SPELLS.KAM_XIRAFF_BUFF.id, event.timestamp)) {
      debug && console.log('Hostile spell and', SPELLS.KAM_XIRAFF_BUFF.name, 'is active, reducing cost (', cost, ') by 75%');
      cost *= 0.25;
    }

    return cost;
  }
}

export default AbilityTracker;
