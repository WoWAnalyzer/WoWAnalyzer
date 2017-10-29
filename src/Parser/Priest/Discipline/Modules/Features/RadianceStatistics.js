import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';

class RadianceStatistics extends Analyzer {
  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.POWER_WORD_RADIANCE.id) {

    }
  }
}

export default RadianceStatistics;
