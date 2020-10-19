import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

class LightOfDawnIndexer extends Analyzer {
  _lightOfDawnHealIndex = 0;
  constructor(options){
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.LIGHT_OF_DAWN_CAST), this.onCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIGHT_OF_DAWN_HEAL), this.onHeal);
  }
  onCast(event) {
    this._lightOfDawnHealIndex = 0;
  }

  onHeal(event) {
    event.lightOfDawnHealIndex = this._lightOfDawnHealIndex;
    this._lightOfDawnHealIndex += 1;
  }
}

export default LightOfDawnIndexer;
