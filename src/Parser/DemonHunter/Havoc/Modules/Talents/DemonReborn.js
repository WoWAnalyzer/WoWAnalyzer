import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';


/**
* Demon Reborn
* Invoking Metamorphosis also resets the cooldowns of Eye Beam, Chaos Nova, and Blur.
**/
class DemonReborn extends Analyzer {
	static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  on_initialized() {
  	this.active = this.combatants.selected.hasTalent(SPELLS.DEMON_REBORN_TALENT.id);
  }

  on_byPlayer_cast(event) {
  	const spellId = event.ability.guid;
  	if (spellId !== SPELLS.METAMORPHOSIS_HAVOC.id) {
  		return;
  	}
  	if (this.spellUsable.isOnCooldown(SPELLS.EYE_BEAM.id)) {
  		this.spellUsable.endCooldown(SPELLS.EYE_BEAM.id);
  	}
  	if (this.spellUsable.isOnCooldown(SPELLS.CHAOS_NOVA.id)) {
  		this.spellUsable.endCooldown(SPELLS.CHAOS_NOVA.id);
  	}
  	if (this.spellUsable.isOnCooldown(SPELLS.BLUR.id)) {
  		this.spellUsable.endCooldown(SPELLS.BLUR.id);
  	}
  }
}

export default DemonReborn;
