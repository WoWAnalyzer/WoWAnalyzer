import SPELLS from 'common/SPELLS';
import CoreChanneling from 'parser/shared/modules/Channeling';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/Analyzer';

class Channeling extends CoreChanneling {

	constructor(options){
		super(options);
		this.addEventListener(Events.applybuff.by(SELECTED_PLAYER), this.onApplyBuff);
		this.addEventListener(Events.removebuff.by(SELECTED_PLAYER), this.onRemoveBuff);
	}

	cancelChannel(event, ability) {
		if(this.isChannelingSpell(SPELLS.EYE_BEAM.id)) {
			this.endChannel(event);
		} else {
			super.cancelChannel(event, ability);
		}
	}

	//Eye beam with the Meta buff doesn't get caught by applybuff for some reason so we also include the on cast

	//Eye Beam w/o the meta buff
	onApplyBuff(event) {
		if(!this.selectedCombatant.hasBuff(SPELLS.METAMORPHOSIS_HAVOC_BUFF.id)) {
			return;
		}
		const spellId = event.ability.guid;
		if(spellId === SPELLS.EYE_BEAM.id) {
			this.beginChannel(event);
			return;
		}
		super.onCast(event);
	}

	//Eye beam with the meta buff
	onCast(event) {
		if(this.selectedCombatant.hasBuff(SPELLS.METAMORPHOSIS_HAVOC_BUFF.id)) {
			return;
		}
		const spellId = event.ability.guid;
		if(spellId === SPELLS.EYE_BEAM.id) {
			this.beginChannel(event);
			return;
		}
		super.onCast(event);
	}

	onRemoveBuff(event) {
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
