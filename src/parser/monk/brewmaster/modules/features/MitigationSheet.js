import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import STAT, { getClassNameColor, getIcon, getName } from 'parser/shared/modules/features/STAT';
import { formatNumber } from 'common/format';
import Panel from 'interface/statistics/Panel';
import SpellLink from 'common/SpellLink';
import Tooltip, { TooltipElement } from 'common/Tooltip';
import { calculatePrimaryStat, calculateSecondaryStatDefault } from 'common/stats';

import { BASE_AGI } from '../../constants';
import CelestialFortune from '../spells/CelestialFortune';
import GiftOfTheOx from '../spells/GiftOfTheOx';
import MasteryValue from '../core/MasteryValue';
import Stagger from '../core/Stagger';
import AgilityValue from './AgilityValue';
import { diminish, lookupK } from '../constants/Mitigation';

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

function makeIcon(stat) {
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

function calculateLeatherArmorScaling(ilvl, amount, targetIlvl) {
  return amount * Math.pow(1.0327, (targetIlvl - ilvl) / 5);
}

export default class MitigationSheet extends Analyzer {
  static dependencies = {
    masteryValue: MasteryValue,
    agilityValue: AgilityValue,
    cf: CelestialFortune,
    stats: StatTracker,
    stagger: Stagger,
    gotox: GiftOfTheOx,
  };

  armorDamageMitigated = 0;
  versDamageMitigated = 0;
  versHealing = 0;

  static statsToAvg = ['agility', 'armor', 'versatility', 'mastery', 'crit'];
  _lastStatUpdate = null;
  _avgStats = {};

  get masteryDamageMitigated() {
    return this.masteryValue.expectedMitigation - this.masteryValue.noMasteryExpectedMitigation;
  }

  get masteryHealing() {
    return this.masteryValue.totalMasteryHealing;
  }

  _critBonusHealing = 0;

  get agiDamageMitigated() {
    return this.agilityValue.totalAgiPurified;
  }

  get agiDamageDodged() {
    return this.masteryValue.expectedMitigation - this.masteryValue.noAgiExpectedDamageMitigated;
  }

  get agiHealing() {
    return this.agilityValue.totalAgiHealing;
  }

  get wdpsHealing() {
    return this.gotox.wdpsBonusHealing;
  }

  get avgIlvl() {
    const gear = this.selectedCombatant._combatantInfo.gear.filter(({id, itemLevel}) => id !== 0 && itemLevel > 1);
    return gear.reduce((sum, {itemLevel}) => sum + itemLevel, 0) / gear.length;
  }

  get K() {
    return lookupK(this.owner.fight);
  }

  constructor(...args) {
    super(...args);

    this._lastStatUpdate = this.owner.fight.start_time;
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

  get bonusCritRatio() {
    return 1 - this.stats.baseCritPercentage / this.stats.currentCritPercentage;
  }

  _onCritHeal(event) {
    if(event.hitType !== HIT_TYPES.CRIT || event.ability.guid === SPELLS.CELESTIAL_FORTUNE_HEAL.id) {
      return;
    }

    // counting absorbed healing because we live in a Vectis world
    const totalHeal = event.amount + (event.overheal || 0) + (event.absorbed || 0);
    this._critBonusHealing += Math.max(totalHeal / 2 - (event.overheal || 0), 0) * this.bonusCritRatio; // remove overhealing from the bonus healing
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

  get normalizer() {
    return this.armorDamageMitigated / this._avgStats.armor;
  }

  increment(fn, amount) {
    return amount - fn(Math.floor(this.avgIlvl), amount, Math.floor(this.avgIlvl)-5);
  }

  get results() {
    return {
      armor: {
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
        avg: this._avgStats.armor,
        gain: [
          { name: 'Physical Damage Mitigated', amount: this.armorDamageMitigated },
        ],
        increment: this.increment(calculateLeatherArmorScaling, this.stats.startingArmorRating),
      },
      wdps: {
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
        avg: this.gotox._wdps,
        gain: [
          { name: <><SpellLink id={SPELLS.GIFT_OF_THE_OX_1.id} /> Healing</>, amount: this.wdpsHealing },
        ],
        increment: calculatePrimaryStat(this.selectedCombatant.mainHand.itemLevel, this.gotox._wdps, this.selectedCombatant.mainHand.itemLevel+5) - this.gotox._wdps,
      },
      [STAT.AGILITY]: {
        icon: makeIcon(STAT.AGILITY),
        name: getName(STAT.AGILITY),
        className: getClassNameColor(STAT.AGILITY),
        avg: this._avgStats.agility - BASE_AGI,
        gain: [
          { name: <><SpellLink id={SPELLS.GIFT_OF_THE_OX_1.id} /> Healing</>, amount: this.agiHealing },
          {
            name: <TooltipElement content="The amount of damage avoided by dodging may be reduced by purification. This is reflected in the range of values.">Dodge</TooltipElement>,
            amount: {
              low: this.agiDamageDodged * (1 - this.stagger.pctPurified),
              high: this.agiDamageDodged,
            },
            isLoaded: this.masteryValue._loaded,
          },
          { name: <>Extra <SpellLink id={SPELLS.PURIFYING_BREW.id} /> Effectiveness</>, amount: this.agiDamageMitigated },
        ],
        increment: this.increment(calculatePrimaryStat, this.stats.startingAgilityRating),
      },
      [STAT.MASTERY]: {
        icon: makeIcon(STAT.MASTERY),
        name: getName(STAT.MASTERY),
        className: getClassNameColor(STAT.MASTERY),
        avg: this._avgStats.mastery,
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
        increment: this.increment(calculateSecondaryStatDefault, this.stats.startingMasteryRating),
      },
      [STAT.VERSATILITY]: {
        icon: makeIcon(STAT.VERSATILITY),
        name: getName(STAT.VERSATILITY),
        className: getClassNameColor(STAT.VERSATILITY),
        avg: this._avgStats.versatility,
        gain: [
          { name: 'Damage Mitigated', amount: this.versDamageMitigated },
          { name: 'Additional Healing', amount: this.versHealing },
        ],
        increment: this.increment(calculateSecondaryStatDefault, this.stats.startingVersatilityRating),
      },
      [STAT.CRITICAL_STRIKE]: {
        icon: makeIcon(STAT.CRITICAL_STRIKE),
        name: getName(STAT.CRITICAL_STRIKE),
        className: getClassNameColor(STAT.CRITICAL_STRIKE),
        avg: this._avgStats.crit,
        gain: [
          { name: <><SpellLink id={SPELLS.CELESTIAL_FORTUNE_HEAL.id} /> Healing</>, amount: this.cf.critBonusHealing },
          { name: 'Critical Heals', amount: this._critBonusHealing },
        ],
        increment: this.increment(calculateSecondaryStatDefault, this.stats.startingCritRating),
      },
    };
  }

  statEntries() {
    return Object.entries(this.results).map(([stat, result]) => {
      const { increment, icon, className, name, avg, gain, tooltip } = result;

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

        let valueEl;
        if(isLoaded !== false) {
          valueEl = formatWeight(gain, avg, this.normalizer, increment);
        } else {
          valueEl = <TooltipElement content="Not Yet Loaded">NYL</TooltipElement>;
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
            <td />
            <td className="text-right">
              {valueEl}
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
          <td className="text-right">
            <b>&times; {increment.toFixed(2)}</b>
          </td>
          <td className="text-right">
            <b>= {formatWeight(totalGain, avg, this.normalizer, increment)}</b>
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
          <th width="45%">
            <b>Stat</b>
          </th>
          <th className="text-right">
            <b>Total</b>
          </th>
          <th className="text-right">
            <Tooltip content={<>The <em>average</em> stat value throughout a fight, including buffs and debuffs, is used here. The value is normalized so that Armor is always 1, and other stats are relative to this.</>}><b>Per Rating (Normalized)</b></Tooltip>
          </th>
          <th className="text-right">
            <Tooltip content="Amount of rating gained from the last 5 average ilvls of your gear. For secondary stats, this assumes the relative amounts of each stat don't change (as if you upgraded each piece by 5 ilvls without actually changing any of them)."><b>Rating &mdash; Last 5 ilvls</b></Tooltip>
          </th>
          <th className="text-right">
            <b>Value &mdash; Last 5 ilvls</b>
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
