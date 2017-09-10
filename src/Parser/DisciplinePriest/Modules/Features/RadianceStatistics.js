import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

class RadianceStatistics extends Module {
  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.POWER_WORD_RADIANCE.id) {
      return;
    }
  }
}

export default RadianceStatistics;
