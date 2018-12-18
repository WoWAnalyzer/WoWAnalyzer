import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import StatisticWrapper from 'interface/others/StatisticWrapper';
import STAT, { getClassNameColor, getIcon, getName } from 'parser/shared/modules/features/STAT';
import { formatNumber } from 'common/format';
import InformationIcon from 'interface/icons/Information';

import CelestialFortune from '../spells/CelestialFortune';
import MasteryValue from '../core/MasteryValue';

// K is a constant that attenuates the diminishing return formula,
// giving lower damage reduction on higher difficulties.
const ULDIR_K = [
  null, // unknown difficulty
  6300, // LFR --- using world K
  null, // unknown
  7736.4, // Normal
  8467.2, // Heroic
  9311.4, // Mythic
];

const MPLUS_K = 7100.1;

function diminish(stat, K) {
  return stat / (stat + K);
}

export default class MitigationSheet extends Analyzer {
  static dependencies = {
    masteryValue: MasteryValue,
    cf: CelestialFortune,
    stats: StatTracker,
  };

  K = null;

  armorDamageMitigated = 0;
  versDamageMitigated = 0;
  versHealing = 0;
  agiDamageMitigated = 0;

  static statsToAvg = ['agility', 'armor', 'versatility', 'mastery', 'crit'];
  _lastStatUpdate = null;
  _avgStats = {};

  get masteryDamageMitigated() {
    return this.masteryValue.expectedMitigation;
  }

  _critBonusHealing = 0;
  get critHealing() {
    return this.cf.totalHealing + this._critBonusHealing;
  }

  constructor(...args) {
    super(...args);

    const fight = this.owner.fight;
    if(fight.size === 5) {
      this.K = MPLUS_K;
    } else {
      this.K = ULDIR_K[fight.difficulty];
    };

    this._lastStatUpdate = fight.start_time;
    this._avgStats = MitigationSheet.statsToAvg.reduce((obj, stat) => {
      obj[stat] = this.stats._pullStats[stat];
      return obj;
    }, {});

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this._onCritHeal);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this._onHealVers);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this._onDamageTaken);
    this.addEventListener('changestats', this._updateStats);
    this.addEventListener(Events.fightend, this._finalizeStats);
  }

  _onCritHeal(event) {
    if(event.hitType !== HIT_TYPES.CRIT || event.ability.guid === SPELLS.CELESTIAL_FORTUNE_HEAL.id) {
      return;
    }

    // counting absorbed healing because we live in a Vectis world
    const totalHeal = event.amount + (event.overheal || 0) + (event.absorbed || 0);
    this._critBonusHealing += Math.max(totalHeal / 2 - (event.overheal || 0), 0); // remove overhealing from the bonus healing
  }

  _onHealVers(event) {
    if(event.ability.guid === SPELLS.CELESTIAL_FORTUNE_HEAL.id) {
      return; // CF is unaffected by vers
    }

    const totalHeal = event.amount + (event.overheal || 0) + (event.absorbed || 0);
    const originalHeal = totalHeal / (1 + this.stats.currentVersatilityPercentage);
    this.versHealing += Math.max(totalHeal - originalHeal - (event.overheal || 0), 0);
  }

  _onDamageTaken(event) {
    if(event.hitType === HIT_TYPES.DODGE) {
      return; // no damage taken, can't do anything
    }
    if(event.unmitigatedAmount === undefined) {
      this.log('Missing unmitigated amount', event);
      return;
    }
    let armorMitigated = 0;
    if(event.ability.type === MAGIC_SCHOOLS.ids.PHYSICAL) {
      armorMitigated = this._mitigate(event, diminish(this.stats.currentArmorRating, this.K));
    }
    // vers mitigation is half the damage/heal %
    const versMitigated = this._mitigate(event, this.stats.currentVersatilityPercentage / 2, armorMitigated);

    this.armorDamageMitigated += armorMitigated;
    this.versDamageMitigated += versMitigated;
  }

  _mitigate(event, drPct, alreadyMitigated = 0) {
    return (event.unmitigatedAmount - alreadyMitigated) * drPct;
  }

  _updateStats(event) {
    const timeDelta = event.timestamp - this._lastStatUpdate;
    if(timeDelta === 0) {
      return; // old stats did nothing
    }
    this._lastStatUpdate = event.timestamp;

    const stats = event.before;

    MitigationSheet.statsToAvg.forEach(stat => {
      this._avgStats[stat] += stats[stat] * timeDelta;
    });
  }

  _finalizeStats(event) {
    const timeDelta = event.timestamp - this._lastStatUpdate;
    this._lastStatUpdate = event.timestamp;

    const stats = this.stats._currentStats;

    MitigationSheet.statsToAvg.forEach(stat => {
      this._avgStats[stat] += stats[stat] * timeDelta;
      this._avgStats[stat] /= this.owner.fightDuration;
    });

  }

  get results() {
    const armorPerPt = this.armorDamageMitigated / this._avgStats.armor;
    return {
      [STAT.ARMOR]: {
        gain: this.armorDamageMitigated,
        weight: 1,
      },
      [STAT.AGILITY]: {
        gain: null,
        weight: 0,
      },
      [STAT.MASTERY]: {
        gain: this.masteryDamageMitigated,
        weight: this.masteryDamageMitigated / this._avgStats.mastery / armorPerPt,
        tooltip: 'Estimated only after the "Expected Mitigation by Mastery" stat is loaded.',
        isLoaded: this.masteryValue._loaded,
      },
      [STAT.VERSATILITY]: {
        gain: this.versDamageMitigated + this.versHealing,
        weight: (this.versDamageMitigated + this.versHealing) / this._avgStats.versatility / armorPerPt,
        tooltip: 'Includes both <em>damage mitigated</em> and <em>increased healing</em>.',
      },
      [STAT.CRITICAL_STRIKE]: {
        gain: this.critHealing,
        weight: this.critHealing / this._avgStats.crit / armorPerPt,
      },
    };
  }

  statistic() {
    return (
      <StatisticWrapper position={STATISTIC_ORDER.CORE(11)}>
        <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12">
          <div className="panel items">
            <div className="panel-heading">
              <h2>
                <dfn data-tip="<b>Effective Healing</b> is the amount of damage that was either <em>prevented</em> or <em>healed</em> by an ability. These values are calculated using the actual circumstances of this encounter. While these are informative for understanding the effectiveness of various stats, they may not necessarily be the best way to gear. The stat values are likely to differ based on personal play, fight, raid size, items used, talents chosen, etc.<br /><br />DPS gains are not included in any of the stat values.">Effective Healing</dfn>

                {this.moreInformationLink && (
                  <a href={this.moreInformationLink} className="pull-right">
                    More info
                  </a>
                )}
              </h2>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              <table className="data-table compact">
                <thead>
                  <tr>
                    <th style={{ minWidth: 30 }}><b>Stat</b></th>
                    <th className="text-right" style={{ minWidth: 30 }}>
                      <b>Total</b>
                    </th>
                    <th className="text-right" style={{ minWidth: 30 }}>
                      <dfn data-tip="Value per rating. Normalized so Armor is always 1.00."><b>Normalized</b></dfn>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(this.results).map(([stat, result]) => {
                    const { gain, weight, tooltip, isLoaded } = result;
                    const Icon = getIcon(stat);

                    let gainEl = 'NYI';
                    if(gain !== null && isLoaded !== false) {
                      gainEl = formatNumber(gain);
                    } else if(gain !== null) {
                      gainEl = <dfn data-tip="Not Yet Loaded">NYL</dfn>;
                    }

                    let valueEl = 'NYI';
                    if(gain !== null && isLoaded !== false) {
                      valueEl = weight.toFixed(2);
                    } else if(gain !== null) {
                      valueEl = <dfn data-tip="Not Yet Loaded">NYL</dfn>;
                    }

                    return (
                      <tr key={stat}>
                        <td className={getClassNameColor(stat)}>
                          <Icon
                            style={{
                              height: '1.6em',
                              width: '1.6em',
                              marginRight: 10,
                            }}
                          />{' '}
                          {tooltip ? <dfn data-tip={tooltip}>{getName(stat)}</dfn> : getName(stat)}
                        </td>
                        <td className="text-right">
                          {gainEl}
                        </td>
                        <td className="text-right">
                          {valueEl}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </StatisticWrapper>
    );
  }
}
