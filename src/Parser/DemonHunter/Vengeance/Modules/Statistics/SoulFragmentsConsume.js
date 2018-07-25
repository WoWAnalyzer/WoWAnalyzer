import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import ExpandableStatisticBox from 'Interface/Others/ExpandableStatisticBox';
import { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';

import SoulFragmentsTracker from '../Features/SoulFragmentsTracker';


class SoulFragmentsConsume extends Analyzer {
  static dependencies = {
    soulFragmentsTracker: SoulFragmentsTracker,
  };

  castTimestamp = 0;
  totalSoulsConsumed = 0;

  soulsConsumedBySpell = {};

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SPIRIT_BOMB_TALENT.id && spellId !== SPELLS.SOUL_CLEAVE.id && spellId !== SPELLS.SOUL_BARRIER_TALENT.id) {
      return;
    }
    if (!this.soulsConsumedBySpell[spellId]) {
      this.soulsConsumedBySpell[spellId] = {name: 0};
      this.soulsConsumedBySpell[spellId] = {souls: 0};
      this.soulsConsumedBySpell[1000000] = {souls: 0};
      this.soulsConsumedBySpell[1000000] = {name: 0};
      this.soulsConsumedBySpell[1000001] = {souls: 0};
      this.soulsConsumedBySpell[1000001] = {name: 0};
    }
    this.soulsConsumedBySpell[spellId].name = event.ability.name;
    this.castTimestamp = event.timestamp;
    this.trackedSpell = spellId;
  }

  on_byPlayer_removebuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SOUL_FRAGMENT_STACK.id) {
      return;
    }
    if (event.timestamp - this.castTimestamp < 100) {
      this.soulsConsumedBySpell[this.trackedSpell].souls += 1;
      this.totalSoulsConsumed += 1;
      }
    }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SOUL_FRAGMENT_STACK.id) {
      return;
    }
    if (event.timestamp - this.castTimestamp < 100) {
      this.soulsConsumedBySpell[this.trackedSpell].souls += 1;
      this.totalSoulsConsumed += 1;
    }
  }


  statistic() {
    this.soulsConsumedBySpell[1000000].souls = this.soulFragmentsTracker.soulsWasted;
    this.soulsConsumedBySpell[1000000].name = 'Overcap';
    this.soulsConsumedBySpell[1000001].souls = this.soulFragmentsTracker.soulsGenerated - this.soulFragmentsTracker.currentSouls - this.soulFragmentsTracker.soulsWasted - this.totalSoulsConsumed;
    this.soulsConsumedBySpell[1000001].name = 'By Touch';
    return (
      <ExpandableStatisticBox
        icon={<SpellIcon id={SPELLS.SOUL_FRAGMENT_STACK.id} />}
        value={`${this.soulFragmentsTracker.soulsGenerated - this.soulFragmentsTracker.currentSouls} Souls`}
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
          </tbody>
        </table>
      </ExpandableStatisticBox>

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(6);

}

export default SoulFragmentsConsume;
