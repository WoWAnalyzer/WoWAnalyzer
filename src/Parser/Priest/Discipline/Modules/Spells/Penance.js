import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import EventGrouper from 'Parser/Core/EventGrouper';

const PENANCE_MINIMUM_RECAST_TIME = 3500; // Minimum duration from one Penance to Another

class Penance extends Analyzer {
  _boltCount = 3;
  hits = 0;
  eventGrouper = new EventGrouper(PENANCE_MINIMUM_RECAST_TIME);

  constructor(...args) {
    super(...args);

    // Castigation Penance bolt count to 4 (from 3)
    this._boltCount = this.selectedCombatant.hasTalent(
      SPELLS.CASTIGATION_TALENT.id
    )
      ? 4
      : 3;
  }

  static isPenance = spellId =>
    spellId === SPELLS.PENANCE.id || spellId === SPELLS.PENANCE_HEAL.id;

  get missedBolts() {
    return [...this.eventGrouper].reduce(
      (missedBolts, cast) => missedBolts + (this._boltCount - cast.length),
      0
    );
  }

  get casts() {
    return [...this.eventGrouper].length;
  }

  get currentBoltNumber() {
    return [...this.eventGrouper].slice(-1)[0].length - 1; // -1 here for legacy code
  }

  on_byPlayer_damage(event) {
    if (!Penance.isPenance(event.ability.guid)) {
      return;
    }

    this.eventGrouper.processEvent(event);

    event.penanceBoltNumber = this.currentBoltNumber;
  }

  on_byPlayer_heal(event) {
    if (!Penance.isPenance(event.ability.guid)) {
      return;
    }

    this.eventGrouper.processEvent(event);

    event.penanceBoltNumber = this.currentBoltNumber;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.PENANCE.id} />}
        value={this.missedBolts}
        label={
          (
<dfn
  data-tip={`Each Penance cast has 3 bolts (4 if you're using Castigation). You should try to let this channel finish as much as possible. You channeled Penance ${
              this.casts
            } times.`}
          >
            Wasted Penance bolts
          </dfn>
)
        }
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default Penance;
