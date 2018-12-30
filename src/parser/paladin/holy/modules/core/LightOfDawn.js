import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Statistic from 'interface/statistics/Statistic';
import char1 from 'interface/statistics/components/AverageHitsPerCast/char1.png';
import char1Active from 'interface/statistics/components/AverageHitsPerCast/char1-active.png';
import char2 from 'interface/statistics/components/AverageHitsPerCast/char2.png';
import char2Active from 'interface/statistics/components/AverageHitsPerCast/char2-active.png';
import char3 from 'interface/statistics/components/AverageHitsPerCast/char3.png';
import char3Active from 'interface/statistics/components/AverageHitsPerCast/char3-active.png';
import char4 from 'interface/statistics/components/AverageHitsPerCast/char4.png';
import char4Active from 'interface/statistics/components/AverageHitsPerCast/char4-active.png';
import char5 from 'interface/statistics/components/AverageHitsPerCast/char5.png';
import char5Active from 'interface/statistics/components/AverageHitsPerCast/char5-active.png';
import './CharacterHitPerCast.scss';

class LightOfDawn extends Analyzer {
  _casts = 0;
  _heals = 0;
  constructor(props) {
    super(props);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.LIGHT_OF_DAWN_CAST), this._onCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIGHT_OF_DAWN_HEAL), this._onHeal);
  }

  _onCast(event) {
    this._casts += 1;
  }
  _onHeal(event) {
    this._heals += 1;
  }

  statistic() {
    const playersHitPerCast = (this._heals / this._casts) || 0;
    const performance = playersHitPerCast / 5;

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(60)}
      >
        <div className="pad">
          <label><SpellIcon id={SPELLS.LIGHT_OF_DAWN_CAST.id} /> Average hits per cast</label>

          <div className="value">{playersHitPerCast.toFixed(2)} players</div>

          <div className="characters-hit-per-cast">
            <div className="backdrop">
              <div style={{ backgroundImage: `url(${char1})` }} />
              <div style={{ backgroundImage: `url(${char2})` }} />
              <div style={{ backgroundImage: `url(${char3})` }} />
              <div style={{ backgroundImage: `url(${char4})` }} />
              <div style={{ backgroundImage: `url(${char5})` }} />
            </div>
            <div className="active">
              <div
                style={{
                  backgroundImage: `url(${char1Active})`,
                  '--p': Math.max(0, Math.min(1, (performance - 0.0) / 0.2)),
                }}
              />
              <div
                style={{
                  backgroundImage: `url(${char2Active})`,
                  '--p': Math.max(0, Math.min(1, (performance - 0.2) / 0.2)),
                }}
              />
              <div
                style={{
                  backgroundImage: `url(${char3Active})`,
                  '--p': Math.max(0, Math.min(1, (performance - 0.4) / 0.2)),
                }}
              />
              <div
                style={{
                  backgroundImage: `url(${char4Active})`,
                  '--p': Math.max(0, Math.min(1, (performance - 0.6) / 0.2)),
                }}
              />
              <div
                style={{
                  backgroundImage: `url(${char5Active})`,
                  '--p': Math.max(0, Math.min(1, (performance - 0.8) / 0.2)),
                }}
              />
            </div>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default LightOfDawn;
