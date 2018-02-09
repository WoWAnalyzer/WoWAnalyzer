import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';

import ResourceTracker from 'Parser/Core/Modules/ResourceTracker/ResourceTracker';

class ComboPointTracker extends ResourceTracker {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.resource = RESOURCE_TYPES.COMBO_POINTS;

    this.maxResource = 5;
  }

  on_byPlayer_cast(event) {
    super.on_byPlayer_cast(event);

    const spellId = event.ability.guid;

    // some point generating spells do not have energize events so they are handled here
    if (spellId === SPELLS.THRASH_FERAL.id || spellId === SPELLS.BRUTAL_SLASH_TALENT.id) {
      this.processInvisibleEnergize(spellId, 1);
    }
  }
}

export default ComboPointTracker;
