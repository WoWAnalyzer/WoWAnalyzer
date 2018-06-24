import React from 'react';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

const TORRENT_HEALING_INCREASE = 0.3;

class Torrent extends Analyzer {
  healing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.TORRENT_TALENT.id);
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

