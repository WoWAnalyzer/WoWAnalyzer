import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import { calculateAzeriteEffects } from 'common/stats';
import CriticalStrikeIcon from 'interface/icons/CriticalStrike';
import HasteIcon from 'interface/icons/Haste';
import MasteryIcon from 'interface/icons/Mastery';
import VersatilityIcon from 'interface/icons/Versatility';
import { formatNumber, formatPercentage } from 'common/format';
import Events from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';

const debug = false;

/*
  Your Mastery is increased by 150, plus an additional 37 for each ally also affected by Loyal to the End, up to 299.
  When you die, your allies gain Critical Strike, Haste, and Versatility equal to their Mastery bonus from this trait.

  Example Logs:
    Resto Druid:  /report/Cbmyth6c7xYvd8FM/16-Heroic+Lady+Ashvane+-+Kill+(2:40)/Séyah
    Rogue:        /report/Cbmyth6c7xYvd8FM/16-Heroic+Lady+Ashvane+-+Kill+(2:40)/Slynestra     <= buff log
    Holy Priest: /report/Tb1qXYy4QAzCZRFV/28-Mythic+The+Queen's+Court+-+Wipe+1+(0:45)/Tgfivethreeo/statistics   <= multiple stacks
 */
const loyalToTheEndStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [baseMastery, additiveMastery, masteryCap] = calculateAzeriteEffects(SPELLS.LOYAL_TO_THE_END.id, rank);

  obj.baseMastery += baseMastery || 0;
  obj.additiveMastery += additiveMastery || 0;
  obj.masteryCap += masteryCap || 0;
  return obj;
}, {
  baseMastery: 0,
  additiveMastery: 0,
  masteryCap: 0,
});

class LoyalToTheEnd extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  baseMastery = 0;
  additiveMastery = 0;
  masteryCap = 0;
  buffData = [];
  playersWithTrait = {};

  get numberOfPlayersWithTrait() {
    if (!this.playersWithTrait) {
      return 0;
    }
    return Object.keys(this.playersWithTrait).length;
  }

  get personalMasteryValue() {
    return Math.min((this.baseMastery + (this.additiveMastery * this.numberOfPlayersWithTrait)), this.masteryCap);
  }

  get buffUptimePercent() {
    return this.buffUptime / this.owner.fightDuration;
  }

  get buffUptime() {
    let uptime = 0;

    this.buffData.forEach(range => {
      uptime += (range.stop - range.start) || 0;
    });

    return uptime;
  }

  get averageBuffContribution() {
    return this.personalMasteryValue * this.buffUptimePercent;
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.LOYAL_TO_THE_END.id);
    if (!this.active) {
      return;
    }

    const { baseMastery, additiveMastery, masteryCap } = loyalToTheEndStats(this.selectedCombatant.traitsBySpellId[SPELLS.LOYAL_TO_THE_END.id]);

    this.baseMastery = baseMastery;
    this.additiveMastery = additiveMastery;
    this.masteryCap = masteryCap;

    this.findPlayersWithTrait();

    // When this buff is active, it gives you as much of each stat as it does mastery.
    // The base mastery you get is always active, so it should be included in the players base data.
    this.statTracker.add(SPELLS.LOYAL_TO_THE_END_SECONDARY_BUFF.id, {
      crit: this.personalMasteryValue,
      haste: this.personalMasteryValue,
      versatility: this.personalMasteryValue,
    });

    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.LOYAL_TO_THE_END_SECONDARY_BUFF), this.applyPersonalBuff);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.LOYAL_TO_THE_END_SECONDARY_BUFF), this.removePersonalBuff);
    this.addEventListener(Events.fightend, this.fightEnd);
  }

  findPlayersWithTrait() {
    for (const combatant of this.owner.combatantInfoEvents) {
      for (const artifact of combatant.artifact) {
        if (artifact.spellID === SPELLS.LOYAL_TO_THE_END.id) {
          this.playersWithTrait[combatant.sourceID] = this.playersWithTrait[combatant.sourceID] ? this.playersWithTrait[combatant.sourceID] : [];
          this.playersWithTrait[combatant.sourceID].push(artifact.rank);
        }
      }
    }
  }

  applyPersonalBuff(event) {
    this.buffData.push({ start: event.timestamp, stop: null });
  }

  removePersonalBuff(event) {
    // Assume that we are removing the first buff in the queue
    for (const i in this.buffData) {
      if (this.buffData[i].stop === null) {
        this.buffData[i].stop = event.timestamp;
        return;
      }
    }
    debug && console.log('Attempted to remove a Loyal To The End buff that didn\'t exist!');
  }

  fightEnd(event) {
    // Clear out all of the buffs that are still active.
    // This is probably unnecessary.
    for (const i in this.buffData) {
      if (this.buffData[i].stop === null) {
        this.buffData[i].stop = event.timestamp;
      }
    }
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.LOYAL_TO_THE_END.id}
        value={(
          <>
            <MasteryIcon /> {formatNumber(this.personalMasteryValue)} <small>average Mastery gained</small><br />
            {this.averageBuffContribution > 0 && (
              <>
                <CriticalStrikeIcon /> {formatNumber(this.averageBuffContribution)} <small>average Critical Strike gained</small><br />
                <HasteIcon /> {formatNumber(this.averageBuffContribution)} <small>average Haste gained</small><br />
                <VersatilityIcon /> {formatNumber(this.averageBuffContribution)} <small>average Versatility gained</small><br />
              </>
            )}
          </>
        )}
        tooltip={(
          <>
            {formatNumber(this.numberOfPlayersWithTrait)} Other players with trait<br />
            {formatPercentage(this.buffUptimePercent)}% Uptime on secondary buff
          </>
        )}
      />
    );
  }
}

export default LoyalToTheEnd;
