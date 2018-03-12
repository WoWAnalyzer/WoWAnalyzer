import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

class LightOfDawnIndexer extends Analyzer {
  _lightOfDawnHealIndex = 0;
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LIGHT_OF_DAWN_CAST.id) {
      return;
    }

    this._lightOfDawnHealIndex = 0;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LIGHT_OF_DAWN_HEAL.id) {
      return;
    }

    event.lightOfDawnHealIndex = this._lightOfDawnHealIndex;
    this._lightOfDawnHealIndex += 1;
  }
}

export default LightOfDawnIndexer;
