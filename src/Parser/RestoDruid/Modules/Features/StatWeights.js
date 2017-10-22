import React from 'react';
import ITEMS from 'common/ITEMS';
import Module from 'Parser/Core/Module';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import { formatNumber } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import HealingValue from 'Parser/Core/Modules/HealingValue';

import { getSpellInfo } from '../../SpellInfo';

const DEBUG = true;

const ARMOR_INT_MULTIPLIER = 1.05; // 5% int bonus from wearing all leather means each new point of int worth 1.05 vs character sheet int
// TODO should I be using CritEffectBonus module instead of this stuff?
const BASE_CRIT_MULTIPLIER = 2;
const DOS_CRIT_BONUS = 0.05;

class StatWeights extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  critMultiplier = BASE_CRIT_MULTIPLIER; // TODO handle Tauren / DoS?

  totalNonIgnoredHealing = 0;
  totalOneInt = 0;
  totalOneCrit = 0;
  totalOneHasteHpm = 0;
//  totalOneHasteHpct = 0;
  totalOneMastery = 0;
  totalOneVers = 0;
  totalOneLeech = 0;

  on_initialized() {
    if(this.combatants.selected.hasBack(ITEMS.DRAPE_OF_SHAME.id)) {
      this.critMultiplier += DOS_CRIT_BONUS;
    }
  }

  on_byPlayer_heal(event) {
    const healVal = new HealingValue(event.amount, event.absorbed, event.overheal);
    this._handleHeal(event, healVal);
  }

  on_byPlayer_absorbed(event) {
    const healVal = new HealingValue(event.amount, 0, 0);
    this._handleHeal(event, healVal);
  }

  _handleHeal(event, healVal) {
    const target = this.combatants.getEntity(event);
    if(target === null) {
      return;
    }

    const amount = healVal.effective;
    const spellInfo = getSpellInfo(event.ability.guid);

    // LEECH //
    // We have to calculate leech weight differently depending on if we already have any leech rating.
    const hasLeech = this.combatants.selected.leechRating > 0; // TODO replace when dynamic stats
    let oneLeech = 0;
    if(hasLeech && spellInfo.isLeech && !healVal.overheal) {
      oneLeech = amount / this.combatants.selected.leechRating; // TODO replace when dynamic stats
      this.totalOneLeech += oneLeech;
    } else if(!hasLeech) {
      // TODO this will be a pain to implement
    }

    if(spellInfo.ignored) {
      return;
    }

    this.totalNonIgnoredHealing += healVal.effective;
    if(healVal.overheal) {
      return; // if a spell overheals, we know it couldn't have healed for more
    }

    const hotCount = target.activeBuffs()
        .map(buffObj => buffObj.ability.guid)
        .filter(buffId => getSpellInfo(buffId).masteryStack)
        .length;

    // INT //
    let oneInt = 0;
    if(spellInfo.int) {
      const currInt = this.combatants.selected.intellect; // TODO replace when dynamic stats
      const bonusFromOneInt = (1 / currInt) * ARMOR_INT_MULTIPLIER;
      oneInt = amount * bonusFromOneInt;
    }

    // CRIT //
    let oneCrit = 0;
    if(spellInfo.crit) {
      const currCritPerc = this.combatants.selected.critPercentage; // TODO replace when dynamic stats
      const bonusFromOneCrit = 1 / 40000; // TODO replace when stat constants exist
      if(spellInfo.isLivingSeed) {
        const additionalLivingSeedChance = bonusFromOneCrit / currCritPerc;
        oneCrit = additionalLivingSeedChance * amount;
      } else {
        const noCritHealing = event.hitType === HIT_TYPES.CRIT ? amount / this.critMultiplier : amount;
        oneCrit = noCritHealing * bonusFromOneCrit * (this.critMultiplier - 1);
      }
    }

    // HASTE //
    // FIXME haste hpct calc is a mess and probably wrong
    const currHastePerc = this.combatants.selected.hastePercentage; // TODO replace when dynamic stats
    const bonusFromOneHaste = 1 / 37500; // TODO replace when stat constants exist
    const noHasteHealing = amount / (1 + currHastePerc);

    let oneHasteHpm = 0;
  //  let oneHasteHpct = 0;
    if(spellInfo.hasteHpm) {
      oneHasteHpm = bonusFromOneHaste * noHasteHealing;
    //  oneHasteHpct = bonusFromOneHaste * noHasteHealing;
    }

    //if(spellInfo.hasteHpct) {
      // let noHasteHpctHealing = noHasteHealing;
      // if(spellInfo.hasteHpm) {
      //   noHasteHpctHealing /= (1 + currHastePerc);
      // }
      //
      // let bonusFromOneHasteHpct = bonusFromOneHaste;
      // if(spellInfo.hasteHpm) {
      //   bonusFromOneHasteHpct *= (1 + bonusFromOneHaste);
      // }
      //
      // oneHasteHpct = bonusFromOneHasteHpct * noHasteHpctHealing;
  //  }

    // MASTERY //
    let oneMastery = 0;
    if(spellInfo.mastery) {
      const currMasteryPerc = this.combatants.selected.masteryPercentage; // TODO replace when dynamic stats
      const bonusFromOneMastery = 1 / 66666; // TODO replace when stat constants exist
      const noMasteryHealing = amount / (1 + (currMasteryPerc * hotCount));
      oneMastery = noMasteryHealing * bonusFromOneMastery * hotCount;
    }

    // VERS //
    let oneVers = 0;
    if(spellInfo.vers) {
      const currVersPerc = this.combatants.selected.versatilityPercentage; // TODO replace when dynamic stats
      const bonusFromOneVers = 1 / 47500; // TODO replace when stat constants exist
      const noVersHealing = amount / (1 + currVersPerc);
      oneVers = noVersHealing * bonusFromOneVers;
    }

    this.totalOneInt += oneInt;
    this.totalOneCrit += oneCrit;
    this.totalOneHasteHpm += oneHasteHpm;
    //this.totalOneHasteHpct += oneHasteHpct;
    this.totalOneMastery += oneMastery;
    this.totalOneVers += oneVers;
  }

  on_finished() {
    if(DEBUG) {
      console.log(`Int - ${formatNumber(this.totalOneInt)}`);
      console.log(`Crit - ${formatNumber(this.totalOneCrit)}`);
      console.log(`Haste HPM - ${formatNumber(this.totalOneHasteHpm)}`);
  //    console.log(`Haste HPCT - ${formatNumber(this.totalOneHasteHpct)}`);
      console.log(`Mastery - ${formatNumber(this.totalOneMastery)}`);
      console.log(`Vers - ${formatNumber(this.totalOneVers)}`);
      console.log(`Leech - ${formatNumber(this.totalOneLeech)}`);
    }
  }

  _ratingPerOnePercent(oneRatingHealing) {
    const onePercentHealing = this.totalNonIgnoredHealing / 100;
    return onePercentHealing / oneRatingHealing;
  }

  _prepareResults() {
    const intWeight = this.totalOneInt / this.totalOneInt;
    const critWeight = this.totalOneCrit / this.totalOneInt;
    const hasteHpmWeight = this.totalOneHasteHpm / this.totalOneInt;
  //  const hasteHpctWeight = this.totalOneHasteHpct / this.totalOneInt;
    const masteryWeight = this.totalOneMastery / this.totalOneInt;
    const versWeight = this.totalOneVers / this.totalOneInt;
    const leechWeight = this.totalOneLeech / this.totalOneInt;

    const intForOnePercent = this._ratingPerOnePercent(this.totalOneInt);
    const critForOnePercent = this._ratingPerOnePercent(this.totalOneCrit);
    const hasteHpmForOnePercent = this._ratingPerOnePercent(this.totalOneHasteHpm);
  //  const hasteHpctForOnePercent = this._ratingPerOnePercent(this.totalOneHasteHpct);
    const masteryForOnePercent = this._ratingPerOnePercent(this.totalOneMastery);
    const versForOnePercent = this._ratingPerOnePercent(this.totalOneVers);
    const leechForOnePercent = this._ratingPerOnePercent(this.totalOneLeech);

    const hasteHpmTooltip = "HPM stands for 'Healing per Mana'. In valuing Haste, it considers only the faster HoT ticking and not the reduced cast times. Effectively it models haste's bonus to mana efficiency. This is typically the better calculation to use for raid encounters where mana is an issue.";
//    const hasteHpctTooltip = "HPCT stands for 'Healing per Cast Time'. In valuing Haste, it considers both the faster HoT ticking and the ability to cast more spells in the same amount of time. This can be good for modeling a burst of healing over several seconds, but remember that over the course of a fight casting more spells means running out of mana faster.";

    return [
      { stat:'Intellect', weight:intWeight, ratingForOne:intForOnePercent },
      { stat:'Crit', weight:critWeight, ratingForOne:critForOnePercent },
      { stat:'Haste (HPM)', weight:hasteHpmWeight, ratingForOne:hasteHpmForOnePercent, tooltip:hasteHpmTooltip },
  //    { stat:'Haste (HPCT)', weight:hasteHpctWeight, ratingForOne:hasteHpctForOnePercent, tooltip:hasteHpctTooltip },
      { stat:'Mastery', weight:masteryWeight, ratingForOne:masteryForOnePercent },
      { stat:'Versatility', weight:versWeight, ratingForOne:versForOnePercent },
      { stat: 'Leech', weight:leechWeight, ratingForOne:leechForOnePercent },
    ];
  }

  item() {
    const results = this._prepareResults();
    return (
      <div>
        <div style={{ marginLeft: 22, marginTop: 16, marginBottom: 14 }}>
          <h4><dfn data-tip="Weights are calculated using your actual items worn, spells cast, and healing done during this encounter. Weights are likely to differ by fight and raid composition.">STAT WEIGHTS</dfn></h4>
        </div>
        <div style={{ marginBottom: 10 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: 30 }}><b>Stat</b></th>
                <th style={{ minWidth: 30 }}><dfn data-tip="Normalized so Intellect is always 1.00"><b>Weight</b></dfn></th>
                <th style={{ minWidth: 30 }}><dfn data-tip="Amount of stat rating required to increase your total healing by 1%"><b>Rating per 1%</b></dfn></th>
              </tr>
            </thead>
            <tbody>
              {results.map(row => (
                <tr>
                  {row.tooltip ? (<td><dfn data-tip={row.tooltip}>{row.stat}</dfn></td>) : (<td>{row.stat}</td>)}
                  <td>{row.weight.toFixed(2)}</td>
                  <td>{formatNumber(row.ratingForOne)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

}

export default StatWeights;
