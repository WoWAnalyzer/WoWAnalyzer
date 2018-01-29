import SPELLS from 'common/SPELLS';
import CoreChanneling from 'Parser/Core/Modules/Channeling';
import Combatants from 'Parser/Core/Modules/Combatants';

class Channeling extends CoreChanneling {
	static dependencies = {
		combatants: Combatants,
	}

	cancelChannel(event, ability) {
		if(this.isChannelingSpell(SPELLS.EYE_BEAM.id)) {
			this.endChannel(event);
		}
		else {
			super.cancelChannel(event, ability);
		}
	}

	//Eye beam with the Meta buff doesn't get caught by applybuff for some reason so we also include the on cast

	//Eye Beam w/o the meta buff
	on_byPlayer_applybuff(event) {
		if(!this.combatants.selected.hasBuff(SPELLS.METAMORPHOSIS_HAVOC_BUFF.id)) {
			return;
		}
		const spellId = event.ability.guid;
		if(spellId === SPELLS.EYE_BEAM.id) {
			this.beginChannel(event);
			return;
		}
		super.on_byPlayer_cast(event);
	}

	//Eye beam with the meta buff
	on_byPlayer_cast(event) {
		if(this.combatants.selected.hasBuff(SPELLS.METAMORPHOSIS_HAVOC_BUFF.id)) {
			return;
		}
		const spellId = event.ability.guid;
		if(spellId === SPELLS.EYE_BEAM.id) {
			this.beginChannel(event);
			return;
		}
		super.on_byPlayer_cast(event);
	}

	on_byPlayer_removebuff(event) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.EYE_BEAM.id) {
      return;
    }
    if (!this.isChannelingSpell(SPELLS.EYE_BEAM.id)) {
      // This may be true if we did the event-order fix in begincast/cast and it was already ended there.
      return;
    }
    this.endChannel(event);
	}
}

export default Channeling;