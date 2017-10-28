import React from 'react';

// import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
// import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import Combatants from 'Parser/Core/Modules/Combatants';
// import HealingValue from 'Parser/Core/Modules/HealingValue';
// import DamageValue from 'Parser/Core/Modules/DamageValue';
import CritEffectBonus from 'Parser/Core/Modules/Helpers/CritEffectBonus';
import StatTracker from 'Parser/Core/Modules/StatTracker';

import CORE_SPELL_INFO from './SpellInfo';

// const DEBUG = true;
//
// const ARMOR_INT_MULTIPLIER = 1.05; // 5% int bonus from wearing all leather means each new point of int worth 1.05 vs character sheet int

class StatWeights extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    critEffectBonus: CritEffectBonus,
    statTracker: StatTracker,
  };

  // region Spell info

  // We assume unlisted spells scale with vers only (this will mostly be trinkets)
  fallbackSpellInfo = {
    int: false,
    crit: false,
    hasteHpm: false,
    hasteHpct: false,
    mastery: false,
    vers: true,
  };
  // This will contain shared settings for things like trinkets and Leech
  sharedSpellInfo = CORE_SPELL_INFO;
  // This is for spec specific implementations to override. It gets priority over defaultSpellInfo.
  spellInfo = {};

  mentioned = [];
  _getSpellInfo(event) {
    const spellId = event.ability.guid;

    const specSpecific = this.spellInfo[spellId];
    if (specSpecific) {
      return specSpecific;
    }
    const shared = this.sharedSpellInfo[spellId];
    if (shared) {
      return shared;
    }

    if (process.env.NODE_ENV === 'development') {
      if (!this.mentioned.includes(spellId)) {
        console.warn(`Missing spell definition: ${spellId}: ${event.ability.name}, using fallback:`, this.fallbackSpellInfo);
        this.mentioned.push(spellId);
      }
    }

    return this.fallbackSpellInfo;
  }

  // endregion

  extraPanel() {
    const results = this._prepareResults();
    return (
      <div className="panel items">
        <div className="panel-heading">
          <h2><dfn data-tip="Weights are calculated using the actual circumstances of this encounter. Weights are likely to differ based on fight, raid size, items used, talents chosen, etc.<br /><br />DPS gains are not included in any of the stat weights.">Stat Weights</dfn>
          </h2>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <table className="data-table compact">
            <thead>
              <tr>
                <th style={{ minWidth: 30 }}><b>Stat</b></th>
                <th style={{ minWidth: 30 }}><dfn data-tip="Normalized so Intellect is always 1.00"><b>Weight</b></dfn></th>
                <th style={{ minWidth: 30 }}><dfn data-tip="Amount of stat rating required to increase your total healing by 1%"><b>Rating per 1%</b></dfn></th>
              </tr>
            </thead>
            <tbody>
              {results.map(row => {
                const weight = row.gain / (this.totalOneInt || 1);
                const ratingForOne = this._ratingPerOnePercent(row.gain);

                return (
                  <tr key={row.stat}>
                    <td>
                      <div className={`${row.className}-bg`} style={{ width: '1em', height: '1em', borderRadius: '50%', display: 'inline-block', marginRight: 5, marginBottom: -2 }} />

                      {row.tooltip ? <dfn data-tip={row.tooltip}>{row.stat}</dfn> : row.stat}
                    </td>
                    <td>{row.gain !== null ? weight.toFixed(2) : 'NYI'}</td>
                    <td>{row.gain !== null ? (
                      ratingForOne === Infinity ? '∞' : formatNumber(ratingForOne)
                    ) : 'NYI'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default StatWeights;
