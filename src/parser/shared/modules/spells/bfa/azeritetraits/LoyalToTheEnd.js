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

/*
  Your Mastery is increased by 150, plus an additional 37 for each ally also affected by Loyal to the End, up to 299.
  When you die, your allies gain Critical Strike, Haste, and Versatility equal to their Mastery bonus from this trait.

  Example Logs:
    Holy Priest:  /report/vVaHPpZN3cmM6x7Y/36-Mythic+Blackwater+Behemoth+-+Kill+(6:12)/Menya
    Resto Druid:  /report/Cbmyth6c7xYvd8FM/16-Heroic+Lady+Ashvane+-+Kill+(2:40)/Séyah
    Rogue:        /report/Cbmyth6c7xYvd8FM/16-Heroic+Lady+Ashvane+-+Kill+(2:40)/Slynestra     <= buff log
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
  baseMastery = 0;
  additiveMastery = 0;
  masteryCap = 0;
  buffUptime = 0;
  buffLastApplied = 0;
  playersWithTrait = {};

  get numberOfPlayersWithTrait() {
    return Object.keys(this.playersWithTrait).length;
  }

  get personalMasteryValue() {
    return Math.min((this.baseMastery + (this.additiveMastery * this.numberOfPlayersWithTrait)), this.masteryCap);
  }

  get buffUptimePercent() {
    return this.buffUptime / this.owner.fightDuration;
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
    this.buffLastApplied = this.buffLastApplied === 0 ? event.timestamp : this.buffLastApplied;
  }

  removePersonalBuff(event) {
    this.buffUptime += event.timestamp - this.buffLastApplied;
    this.buffLastApplied = 0;
  }

  fightEnd(event) {
    if (this.buffLastApplied !== 0) {
      this.buffUptime += event.timestamp - this.buffLastApplied;
      this.buffLastApplied = 0;
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
