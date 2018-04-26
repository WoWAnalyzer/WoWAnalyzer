import React from 'react';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

const TORRENT_HEALING_INCREASE = 0.3;

class Torrent extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.TORRENT_TALENT.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.RIPTIDE.id || event.tick) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, TORRENT_HEALING_INCREASE);
  }

  on_feed_heal(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.RIPTIDE.id || event.tick) {
      return;
    }
        
    this.healing += event.feed * TORRENT_HEALING_INCREASE;
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.TORRENT_TALENT.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %
        </div>
      </div>
    );
  }

}

export default Torrent;

