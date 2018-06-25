import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';

class SpiritOfRedemption extends Analyzer {

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if(spellId !== SPELLS.SPIRIT_OF_REDEMPTION_BUFF.id) {
      return;
    }

    this.owner.fabricateEvent({
      ...event,
      type: 'cast',
    }, event);
  }

}
export default SpiritOfRedemption;
