import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import StatisticBox from 'interface/others/StatisticBox';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';

import SoulFragmentsTracker from '../features/SoulFragmentsTracker';
import MAX_SOUL_FRAGMENTS from '../features/SoulFragmentsTracker';
import Events from 'parser/core/Events';

const REMOVE_STACK_BUFFER = 100;

class SoulFragmentsConsume extends Analyzer {
  static dependencies = {
    soulFragmentsTracker: SoulFragmentsTracker,
  };

  castTimestamp = undefined;
  totalSoulsConsumedBySpells = 0;

  soulsConsumedBySpell = {};

  constructor(options){
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.SPIRIT_BOMB_TALENT, SPELLS.SOUL_CLEAVE, SPELLS.SOUL_BARRIER_TALENT]), this.onCast);
    this.addEventListener(Events.changebuffstack.by(SELECTED_PLAYER).spell(SPELLS.SOUL_FRAGMENT_STACK), this.onChangeBuffStack);
  }

  onCast(event) {
    const spellId = event.ability.guid;
    if (!this.soulsConsumedBySpell[spellId]) {
      this.soulsConsumedBySpell[spellId] = {
        name: event.ability.name,
        souls: 0,
      };
    }
    this.castTimestamp = event.timestamp;
    this.trackedSpell = spellId;
  }

  onChangeBuffStack(event) {
    if ( event.oldStacks < event.newStacks || // not interested in soul gains
        event.oldStacks > MAX_SOUL_FRAGMENTS) { // not interested in overcap corrections
      return;
    }
    if (this.castTimestamp !== undefined && (event.timestamp - this.castTimestamp) < REMOVE_STACK_BUFFER) {
      const consumed = event.oldStacks - event.newStacks;
      this.soulsConsumedBySpell[this.trackedSpell].souls += consumed;
      this.totalSoulsConsumedBySpells += consumed;
    }
  }

  soulCleaveSouls() {
    if(this.soulsConsumedBySpell[SPELLS.SOUL_CLEAVE.id] === undefined) {
      return 0;
    }
    return this.soulsConsumedBySpell[SPELLS.SOUL_CLEAVE.id].souls;
  }

  statistic() {
    const soulsByTouch = this.soulFragmentsTracker.soulsGenerated - this.totalSoulsConsumedBySpells;
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(6)}
        icon={<SpellIcon id={SPELLS.SOUL_FRAGMENT_STACK.id} />}
        value={`${this.soulFragmentsTracker.soulsSpent} Souls`}
        label="Consumed"
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Name</th>
              <th>Souls Consumed</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(this.soulsConsumedBySpell).map((e, i) => (
              <tr key={i}>
                <th>{e.name}</th>
                <td>{e.souls}</td>
              </tr>
            ))}
            <tr>
              <th>Overcapped</th>
              <td>{this.soulFragmentsTracker.overcap}</td>
            </tr>
            <tr>
              <th>By Touch</th>
              <td>{soulsByTouch}</td>
            </tr>
          </tbody>
        </table>
      </StatisticBox>

    );
  }

}

export default SoulFragmentsConsume;
