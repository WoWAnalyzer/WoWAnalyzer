import React from 'react';
import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import { formatNumber } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import HealingValue from 'Parser/Core/Modules/HealingValue';
import CritEffectBonus from 'Parser/Core/Modules/Helpers/CritEffectBonus';

import { getSpellInfo } from '../../SpellInfo';

const DEBUG = true;

const ARMOR_INT_MULTIPLIER = 1.05; // 5% int bonus from wearing all leather means each new point of int worth 1.05 vs character sheet int

class StatWeights extends Module {
  static dependencies = {
    combatants: Combatants,
    critEffectBonus: CritEffectBonus,
  };

  concordanceAmount = 0; // TODO remove when stat tracker added

  totalAdjustedHealing = 0; // total healing after excluding 'multiplier' spells like Leech / Velens

  // These are the total healing that would be gained if their respective stats ratings were increased by one.
  totalOneInt = 0;
  totalOneCrit = 0;
  totalOneHasteHpm = 0;
//  totalOneHasteHpct = 0;
  totalOneMastery = 0;
  totalOneVers = 0;
  totalOneLeech = 0;

  on_initialized() {
    this.concordanceAmount = 3700 + (this.combatants.selected.traitsBySpellId[SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_TRAIT.id] || 0) * 300; // TODO remove when stat tracker added
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
    // Leech is marked as a 'multplier' heal, so we have to check it before we do the early return below
    const hasLeech = this.combatants.selected.leechRating > 0; // TODO replace when dynamic stats
    let oneLeech = 0;
    if(hasLeech && spellInfo.isLeech && !healVal.overheal) {
      oneLeech = amount / this.combatants.selected.leechRating; // TODO replace when dynamic stats
    } else if(!hasLeech) {
      // TODO this will be a pain to implement
    }
    this.totalOneLeech += oneLeech;

    if(spellInfo.multiplier) {
      return; // multiplier heals don't count for weights and they're adjusted out for total healing
    }
    this.totalAdjustedHealing += healVal.effective;
    if(spellInfo.ignored) {
      return; // ignored heals don't count for weights but they are part of adjusted total healing
    }

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
      const currInt = this._getCurrInt(); // TODO replace when dynamic stats
      const bonusFromOneInt = (1 / currInt) * ARMOR_INT_MULTIPLIER;
      oneInt = amount * bonusFromOneInt;
    }
    this.totalOneInt += oneInt;

    // CRIT //
    let oneCrit = 0;
    if(spellInfo.crit) {
      const currCritPerc = this.combatants.selected.critPercentage; // TODO replace when dynamic stats
      const bonusFromOneCrit = 1 / 40000; // TODO replace when stat constants exist
      if(spellInfo.isLivingSeed) {
        // Living Seed doesn't crit, but it procs from crits only. This calculation approximates increased LS frequency due to more crits.
        const additionalLivingSeedChance = bonusFromOneCrit / currCritPerc;
        oneCrit = additionalLivingSeedChance * amount;
      } else {
        const critMult = this.critEffectBonus.getBonus(event);
        const noCritHealing = event.hitType === HIT_TYPES.CRIT ? amount / critMult : amount;
        oneCrit = noCritHealing * bonusFromOneCrit * (critMult - 1);
      }
    }
    this.totalOneCrit += oneCrit;

    // HASTE //
    const currHastePerc = this.combatants.selected.hastePercentage; // TODO replace when dynamic stats
    const bonusFromOneHaste = 1 / 37500; // TODO replace when stat constants exist
    const noHasteHealing = amount / (1 + currHastePerc);

    let oneHasteHpm = 0;
    if(spellInfo.hasteHpm) {
      oneHasteHpm = bonusFromOneHaste * noHasteHealing;
    }
    this.totalOneHasteHpm += oneHasteHpm;

    // FIXME Previous hasteHpct calculation was unsatisfactory. Excluding entirely for now.

    // MASTERY //
    let oneMastery = 0;
    if(spellInfo.mastery) {
      const currMasteryPerc = this._getCurrMasteryPerc(); // TODO replace when dynamic stats
      const bonusFromOneMastery = 1 / 66666; // TODO replace when stat constants exist
      const noMasteryHealing = amount / (1 + (currMasteryPerc * hotCount));
      oneMastery = noMasteryHealing * bonusFromOneMastery * hotCount;
    }
    this.totalOneMastery += oneMastery;

    // VERS //
    let oneVers = 0;
    if(spellInfo.vers) {
      const currVersPerc = this.combatants.selected.versatilityPercentage; // TODO replace when dynamic stats
      const bonusFromOneVers = 1 / 47500; // TODO replace when stat constants exist
      const noVersHealing = amount / (1 + currVersPerc);
      oneVers = noVersHealing * bonusFromOneVers;
    }
    this.totalOneVers += oneVers;
  }

  // FIXME temporary hacky handler for Concordance until stat tracker is implemented
  _getCurrInt() {
    let currInt = this.combatants.selected.intellect;
    if(this.combatants.selected.hasBuff(SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_INTELLECT.id)) {
      currInt += this.concordanceAmount;
    }
    return currInt;
  }

  // FIXME temporary hacky handler for 2t19 until stat tracker is implemented
  _getCurrMasteryPerc() {
    let currMastery = this.combatants.selected.masteryRating;
    if(this.combatants.selected.hasBuff(SPELLS.ASTRAL_HARMONY.id)) {
      currMastery += 4000;
    }
    return 0.048 + (currMastery / 66666.6666666);
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
    const onePercentHealing = this.totalAdjustedHealing / 100;
    return onePercentHealing / oneRatingHealing;
  }

  _prepareResults() {
    const hasLeech = this.combatants.selected.leechRating > 0;

    const intWeight = this.totalOneInt / this.totalOneInt;
    const critWeight = this.totalOneCrit / this.totalOneInt;
    const hasteHpmWeight = this.totalOneHasteHpm / this.totalOneInt;
  //  const hasteHpctWeight = this.totalOneHasteHpct / this.totalOneInt;
    const masteryWeight = this.totalOneMastery / this.totalOneInt;
    const versWeight = this.totalOneVers / this.totalOneInt;
    let leechWeight = this.totalOneLeech / this.totalOneInt;
    if(!hasLeech) {
      leechWeight = "NYI";
    }

    const intForOnePercent = this._ratingPerOnePercent(this.totalOneInt);
    const critForOnePercent = this._ratingPerOnePercent(this.totalOneCrit);
    const hasteHpmForOnePercent = this._ratingPerOnePercent(this.totalOneHasteHpm);
  //  const hasteHpctForOnePercent = this._ratingPerOnePercent(this.totalOneHasteHpct);
    const masteryForOnePercent = this._ratingPerOnePercent(this.totalOneMastery);
    const versForOnePercent = this._ratingPerOnePercent(this.totalOneVers);
    let leechForOnePercent = this._ratingPerOnePercent(this.totalOneLeech);
    if(!hasLeech) {
      leechForOnePercent = "NYI";
    }

    const hasteHpmTooltip = "HPM stands for 'Healing per Mana'. In valuing Haste, it considers only the faster HoT ticking and not the reduced cast times. Effectively it models haste's bonus to mana efficiency. This is typically the better calculation to use for raid encounters where mana is an issue.";
//    const hasteHpctTooltip = "HPCT stands for 'Healing per Cast Time'. In valuing Haste, it considers both the faster HoT ticking and the ability to cast more spells in the same amount of time. This can be good for modeling a burst of healing over several seconds, but remember that over the course of a fight casting more spells means running out of mana faster.";
    const leechTooltip = "Leech weight can currently only be calculated when player already has some Leech rating";

    return [
      { stat:'Intellect', weight:intWeight, ratingForOne:intForOnePercent },
      { stat:'Crit', weight:critWeight, ratingForOne:critForOnePercent },
      { stat:'Haste (HPM)', weight:hasteHpmWeight, ratingForOne:hasteHpmForOnePercent, tooltip:hasteHpmTooltip },
  //    { stat:'Haste (HPCT)', weight:hasteHpctWeight, ratingForOne:hasteHpctForOnePercent, tooltip:hasteHpctTooltip },
      { stat:'Mastery', weight:masteryWeight, ratingForOne:masteryForOnePercent },
      { stat:'Versatility', weight:versWeight, ratingForOne:versForOnePercent },
      { stat: 'Leech', weight:leechWeight, ratingForOne:leechForOnePercent, tooltip:leechTooltip },
    ];
  }

  extraPanel() {
    const results = this._prepareResults();
    return (
      <div className="panel items">
      <div className="panel-heading">
        <h2><dfn data-tip="Weights are calculated using the actual circumstances of this encounter. Weights are likely to differ based on fight, raid size, items used, talents chosen, etc.">STAT WEIGHTS</dfn>
        </h2>
      </div>
      <div className="panel-body" style={{ padding: 0 }}>
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
