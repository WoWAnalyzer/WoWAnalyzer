import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import ExpandableStatisticBox from 'Main/ExpandableStatisticBox';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatNumber, formatDuration } from 'common/format';

import Combatants from 'Parser/Core/Modules/Combatants';

import Analyzer from 'Parser/Core/Analyzer';

import { ABILITIES_AFFECTED_BY_MASTERY } from '../../Constants';

class ComboStrikes extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  _lastSpellUsed = null;
  _lastThreeSpellsUsed = [];
  masteryDropSpellSequence = [];

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const eventTimestamp = event.timestamp;

    if(!ABILITIES_AFFECTED_BY_MASTERY.includes(spellId)) {
        return;
    }

    // Track Details on the last 3 spells used - Need to populate up to 3 first, then begin to modify the array.
    if(this._lastThreeSpellsUsed.length < 3) {
        this._lastThreeSpellsUsed.push({
            ability: spellId,
            timestamp: eventTimestamp,
        });
    } else {
        this._lastThreeSpellsUsed = this._lastThreeSpellsUsed.slice(1);
        this._lastThreeSpellsUsed.push({
            ability: spellId,
            timestamp: eventTimestamp,
        });
    }

    if(this._lastSpellUsed === spellId) {
        this.masteryDropSpellSequence.push(this._lastThreeSpellsUsed);
    }
    this._lastSpellUsed = spellId;
  }

  get suggestionThresholds() {
    return {
      actual: this.masteryDropSpellSequence.length,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 1,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You ignored your <SpellLink id={SPELLS.COMBO_STRIKES.id} /> buff by casting the same spell twice in a row. This directly lowers your overall damage, and if you have <SpellLink id={SPELLS.HIT_COMBO_TALENT.id} /> talented, you will also drop all stacks of this damage buff.</span>)
          .icon(SPELLS.COMBO_STRIKES.icon)
          .actual(`${this.masteryDropSpellSequence.length} instances where mastery dropped.`)
          .recommended(`${recommended} times mastery should be dropped`);
      });
  }

  statistic() {
    const masteryDropEvents = this.masteryDropSpellSequence.length;

    return (
      <ExpandableStatisticBox
        icon={<SpellIcon id={SPELLS.COMBO_STRIKES.id} />}
        value={`${formatNumber(masteryDropEvents)}`}
        label={(
          <dfn data-tip="This is the number of times you incorrectly casted the same spell twice in a row. While on its own this may be a minor mistake, if you combine this with the Hit Combo talent, you will also lose all of the damage increase provided by that talent buff."
          >
            Mastery Benefit Mistakes
          </dfn>
        )}
      >
        <div>
          Spell sequence when mastery dropped.
        </div>
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>1</th>
              <th>2</th>
              <th>3</th>
            </tr>
          </thead>
          <tbody>
            {
              this.masteryDropSpellSequence
                .map((item, index) => (
                  <tr key={index}>
                    <th scope="row">{formatDuration((item[0].timestamp - this.owner.fight.start_time) / 1000)}</th>
                    <td><SpellIcon id={item[0].ability} style={{ height: '2.4em' }} /></td>
                    <td><SpellIcon id={item[1].ability} style={{ height: '2.4em' }} /></td>
                    {item[2] && item[2].ability && (
                      <td><SpellIcon id={item[2].ability} style={{ height: '2.4em' }} /></td>
                    )}
                  </tr>
                ))
            }
          </tbody>
        </table>
      </ExpandableStatisticBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);

}

export default ComboStrikes;
