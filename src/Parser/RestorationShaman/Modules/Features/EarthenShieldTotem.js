import Module from 'Parser/Core/Module';

import SPELLS from 'common/SPELLS';

class EarthenShieldTotem extends Module {
  activeEST = null;
  potentialHealing = 0;
  healing = 0;


  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasTalent(SPELLS.EARTHEN_SHIELD_TOTEM_TALENT.id);
  }

  on_damage(event) {
    const spellId = event.ability.guid;

    if (!(spellId === SPELLS.EARTHEN_SHIELD_TOTEM_SELF_DAMAGE.id)) {
      return;
    }

    if (event.targetID === this.activeEST) {
      this.healing += (event.amount || 0) + (event.overheal || 0) + (event.absorb || 0);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (!(spellId === SPELLS.EARTHEN_SHIELD_TOTEM_CAST.id)) {
      return;
    }

    this.potentialHealing += event.maxHitPoints;
  }

  on_byPlayer_summon(event) {
    const spellId = event.ability.guid;

    if (!(spellId === SPELLS.EARTHEN_SHIELD_TOTEM_CAST.id)) {
      return;
    }

    // Store the id of the totem we summoned so that we don't include the EST of other rshamans.
    this.activeEST = event.targetID;
  }
}

export default EarthenShieldTotem;

