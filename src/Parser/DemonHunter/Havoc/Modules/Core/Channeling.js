import SPELLS from 'common/SPELLS';
import CoreChanneling from 'Parser/Core/Modules/Channeling';
import { formatMilliseconds } from 'common/format';

class Channeling extends CoreChanneling {

	cancelChannel(event, ability) {
		if(this.isChannelingSpell(SPELLS.EYE_BEAM.id)) {
			this.endChannel(event);
			console.log(formatMilliseconds(event.timestamp - this.owner.fight.start_time), 'Channeling', 'Marking', this._currentChannel.ability.name, 'as ended since we started casting something else');
		}
		else {
			super.cancelChannel(event, ability);
		}
	}

	on_byPlayer_applybuff(event) {
		const spellId = event.ability.guid;
		if(spellId !== SPELLS.EYE_BEAM.id) {
			return;
		}
		this.beginChannel(event);
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