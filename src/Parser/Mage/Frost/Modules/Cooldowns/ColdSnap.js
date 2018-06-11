import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

class ColdSnap extends Analyzer {

	static dependencies = {
		combatants: Combatants,
		spellUsable: SpellUsable,
	}

  	on_byPlayer_cast(event) {
		const spellId = event.ability.guid;
		if(spellId !== SPELLS.COLD_SNAP.id) {
			return;
		}
		if (this.spellUsable.isOnCooldown(SPELLS.ICE_BARRIER.id)) { this.spellUsable.endCooldown(SPELLS.ICE_BARRIER.id); }
		if (this.spellUsable.isOnCooldown(SPELLS.CONE_OF_COLD.id)) { this.spellUsable.endCooldown(SPELLS.CONE_OF_COLD.id); }
		if (this.spellUsable.isOnCooldown(SPELLS.FROST_NOVA.id)) { this.spellUsable.endCooldown(SPELLS.FROST_NOVA.id); }
		if (this.spellUsable.isOnCooldown(SPELLS.ICE_BLOCK.id)) { this.spellUsable.endCooldown(SPELLS.ICE_BLOCK.id); }
  }
}

export default ColdSnap;
