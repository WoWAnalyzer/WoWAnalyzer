import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { EventType } from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';
import safeMerge from 'common/safeMerge';
import SPELLS from 'common/SPELLS';
import STAT, { getClassNameColor, getIcon, getName } from 'parser/shared/modules/features/STAT';
import { formatNumber } from 'common/format';
import Panel from 'interface/statistics/Panel';
import SpellLink from 'common/SpellLink';
import Tooltip, { TooltipElement } from 'common/Tooltip';
import HIT_TYPES from 'game/HIT_TYPES';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';

import GiftOfTheOx from '../spells/GiftOfTheOx';
import MasteryValue from '../core/MasteryValue';
import Stagger from '../core/Stagger';
import { diminish, lookupK } from '../constants/Mitigation';
import { BASE_AGI } from '../../constants';

function formatGain(gain) {
  if(typeof gain === 'number') {
    return formatNumber(gain);
  } else if(gain.low !== undefined && gain.high !== undefined) {
    return `${formatNumber(gain.low)} - ${formatNumber(gain.high)}`;
  }
  return null;
}

function formatWeight(gain, avg, norm, inc) {
  if(typeof gain === 'number') {
    return (gain / avg / norm * inc).toFixed(2);
  } else if(gain.low !== undefined && gain.high !== undefined) {
    return `${(gain.low / avg / norm * inc).toFixed(2)} - ${(gain.high / avg / norm * inc).toFixed(2)}`;
  }
  return null;
}

function calculateTotalGain(gain) {
  const { low, high } = gain
    .filter(({isLoaded}) => isLoaded !== false)
    .reduce(({low, high}, {amount}) => {
    if(typeof amount === 'number') {
      low += amount;
      high += amount;
    } else if(amount.low !== undefined && amount.high !== undefined) {
      low += amount.low;
      high += amount.high;
    }
    return {
      low, high,
    };
  }, { low: 0, high: 0 });

  if(low === high) {
    return low;
  }

  return {
    low, high,
  };
}

export function makeIcon(stat) {
  const Icon = getIcon(stat);
  return (
    <Icon
      style={{
        height: '1.6em',
        width: '1.6em',
        marginRight: 10,
      }}
    />
  );
}

export default class MitigationSheet extends Analyzer {
  static dependencies = {
    masteryValue: MasteryValue,
    stats: StatTracker,
    stagger: Stagger,
    gotox: GiftOfTheOx,
  };

  armorDamageMitigated = 0;

  _lastStatUpdate = null;
  _avgStats = {};

  get masteryDamageMitigated() {
    return this.masteryValue.expectedMitigation - this.masteryValue.noMasteryExpectedMitigation;
  }

  get masteryHealing() {
    return this.masteryValue.totalMasteryHealing;
  }


  get wdpsHealing() {
    return this.gotox.wdpsBonusHealing;
  }

  get K() {
    return lookupK(this.owner.fight);
  }

  constructor(...args) {
    super(...args);

    this._lastStatUpdate = this.owner.fight.start_time;

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this._onDamageTaken);
    this.addEventListener(EventType.ChangeStats, this._updateStats);
    this.addEventListener(Events.fightend, this._finalizeStats);
  }

  _onDamageTaken(event) {
    if(event.hitType === HIT_TYPES.DODGE) {
      return; // no damage taken, can't do anything
    }
    if(event.unmitigatedAmount === undefined) {
      this.log('Missing unmitigated amount', event);
      return;
    }
    if(event.ability.type !== MAGIC_SCHOOLS.ids.PHYSICAL) {
      return;
    }
    const armorMitigated = this._mitigate(event, diminish(this.stats.currentArmorRating, this.K));
    this.armorDamageMitigated += armorMitigated;
    event._mitigated = armorMitigated;
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

    this.statsToAvg.forEach(stat => {
      if(this._avgStats[stat] === undefined) {
        this._avgStats[stat] = 0;
      }
      this._avgStats[stat] += stats[stat] * timeDelta;
    });
  }

  _finalizeStats(event) {
    const timeDelta = event.timestamp - this._lastStatUpdate;
    this._lastStatUpdate = event.timestamp;

    const stats = this.stats._currentStats;

    this.statsToAvg.forEach(stat => {
      if(this._avgStats[stat] === undefined) {
        this._avgStats[stat] = 0;
      }
      this._avgStats[stat] += stats[stat] * timeDelta;
      this._avgStats[stat] /= this.owner.fightDuration;
    });

  }

  get normalizer() {
    return this.armorDamageMitigated / this._avgStats.armor;
  }

  /**
   * Results that haven't yet been moved to other modules.
   *
   * DO NOT ADD ANYTHING TO THIS. REMOVE ONLY.
   */
  get baseResults() {
    return {
      armor: {
        priority: 0,
        icon: (
          <img
            src="/img/shield.png"
            style={{
              border: 0,
              marginRight: 10,
            }}
            alt="Shield"
          />
        ),
        name: 'Armor',
        className: 'stat-stamina',
        statName: 'armor',
        gain: [
          { name: 'Physical Damage Mitigated', amount: this.armorDamageMitigated },
        ],
      },
      wdps: {
        priority: 1,
        icon: (
          <img
            src="/img/sword.png"
            style={{
              border: 0,
              marginRight: 10,
            }}
            alt="Sword"
          />
        ),
        name: 'Weapon DPS',
        className: 'stat-criticalstrike',
        statAmount: this.gotox._wdps,
        gain: [
          { name: <><SpellLink id={SPELLS.GIFT_OF_THE_OX_1.id} /> Healing</>, amount: this.wdpsHealing },
        ],
      },
      [STAT.MASTERY]: {
        priority: 3,
        icon: makeIcon(STAT.MASTERY),
        name: getName(STAT.MASTERY),
        className: getClassNameColor(STAT.MASTERY),
        statName: STAT.MASTERY,
        gain: [
          { name: <><SpellLink id={SPELLS.GIFT_OF_THE_OX_1.id} /> Healing</>, amount: this.masteryHealing },
          {
            name: <TooltipElement content="The amount of damage avoided by dodging may be reduced by purification. This is reflected in the range of values.">Dodge</TooltipElement>,
            amount:{
              low: this.masteryDamageMitigated * (1 - this.stagger.pctPurified),
              high: this.masteryDamageMitigated,
            },
            isLoaded: this.masteryValue._loaded,
          },
        ],
      },
    };
  }

  _registeredResults = {};

  registerStat(key, statResults) {
    if(this._registeredResults[key] !== undefined) {
      console.warn("Overwriting mitigation stat results for ", key);
    }
    this._registeredResults[key] = statResults;
  }

  get results() {
    return safeMerge(this.baseResults, this._registeredResults);
  }

  get statsToAvg() {
    return Object.values(this.results)
      .filter(obj => obj.statName !== undefined)
      .map(({statName}) => statName);
  }

  avg(stat) {
    return this._avgStats[stat];
  }

  statEntries() {
    return Object.entries(this.results)
      .sort(([_keyA, resultA], [_keyB, resultB]) => resultA.priority - resultB.priority)
      .map(([stat, result]) => {
        const { icon, className, name, statName, statAmount, gain, tooltip } = result;

        // some stats are fixed (WDPS). others are calculated via
        // averaging
        let avg = statAmount ? statAmount : this.avg(statName);
        // not sure its worth introducing a "base" parameter when
        // literally only agi would use it
        if(statName === 'agility') {
          avg -= BASE_AGI;
        }

        const totalGain = calculateTotalGain(gain);

        const rows = gain.map(({ name, amount: gain, isLoaded }, i) => {
          let gainEl;
          if(isLoaded !== false) {
            gainEl = formatGain(gain);
          } else {
            gainEl = <TooltipElement content="Not Yet Loaded">NYL</TooltipElement>;
          }

          let perPointEl;
          if(isLoaded !== false) {
            perPointEl = formatWeight(gain, avg, this.normalizer, 1);
          } else {
            perPointEl = <TooltipElement content="Not Yet Loaded">NYL</TooltipElement>;
          }

          return (
            <tr key={`${stat}-${i}`}>
              <td style={{paddingLeft: '5em'}}>
                {name}
              </td>
              <td className="text-right">
                {gainEl}
              </td>
              <td className="text-right">
                {perPointEl}
              </td>
            </tr>
          );
        });

        return (
          <>
          <tr key={stat}>
            <td className={className}>
              {icon}{' '}
              {tooltip ? <TooltipElement content={tooltip}>{name}</TooltipElement> : name}
            </td>
            <td className="text-right">
              <b>{formatGain(totalGain)}</b>
            </td>
            <td className="text-right">
              <b>{formatWeight(totalGain, avg, this.normalizer, 1)}</b>
            </td>
          </tr>
          {rows}
      </>
      );
      });
  }

  entries() {
    return (
      <>
      <thead>
        <tr>
          <th width="75%">
            <b>Stat</b>
          </th>
          <th className="text-right">
            <b>Total</b>
          </th>
          <th className="text-right">
            <Tooltip content={<>The <em>average</em> stat value throughout a fight, including buffs and debuffs, is used here. The value is normalized so that Armor is always 1, and other stats are relative to this.</>}><b>Per Rating (Normalized)</b></Tooltip>
          </th>
        </tr>
      </thead>
      <tbody>
        {this.statEntries()}
      </tbody>
      </>
    );
  }

  statistic() {
    return (
      <Panel
        title="Mitigation Values"
        explanation={(
          <>
            Relative value of different stats for mitigation on this specific log measured by <em>Effective Healing</em>. <b>These values are not stat weights, and should not be used with Pawn or other stat-weight addons.</b><br /><br />

            <b>Effective Healing</b> is the amount of damage that was either <em>prevented</em> or <em>healed</em> by an ability. These values are calculated using the actual circumstances of this encounter. While these are informative for understanding the effectiveness of various stats, they may not necessarily be the best way to gear. The stat values are likely to differ based on personal play, fight, raid size, items used, talents chosen, etc.<br /><br />DPS gains are not included in any of the stat values. See <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/parser/monk/brewmaster/modules/features/MitigationSheet.md">here</a> for more information on valuation methods.
          </>
        )}
        position={200}
        pad={false}
      >
        <table className="data-table">
          {this.entries()}
        </table>
      </Panel>
    );
  }
}
