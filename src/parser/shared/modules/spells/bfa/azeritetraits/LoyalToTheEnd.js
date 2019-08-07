import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import Events from 'parser/core/Events';
import { calculateAzeriteEffects } from 'common/stats';
import MasteryIcon from 'interface/icons/Mastery';
import { formatNumber } from 'common/format';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

/*
  Your Mastery is increased by 150, plus an additional 37 for each ally also affected by Loyal to the End, up to 299.
  When you die, your allies gain Critical Strike, Haste, and Versatility equal to their Mastery bonus from this trait.

  Example Logs:
    Holy Priest:  /report/vVaHPpZN3cmM6x7Y/36-Mythic+Blackwater+Behemoth+-+Kill+(6:12)/Menya/overview
    Disc Priest:
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
  playersWithTrait = {};

  get numberOfPlayersWithTrait() {
    return Object.keys(this.playersWithTrait).length;
  }

  get personalMasteryValue() {
    console.log(this.masteryCap);
    return Math.min((this.baseMastery + (this.additiveMastery * this.numberOfPlayersWithTrait)), this.masteryCap);
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

    //this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.LOYAL_TO_THE_END_PRIMARY_BUFF), this.applyPersonalBuff);
    //this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.LOYAL_TO_THE_END_PRIMARY_BUFF), this.applySecondaryBuff);
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

  buffs = {};
  on_byPlayer_applybuff(event) {
    this.buffs[event.ability.guid] = event.ability.name;
  }

  applyPersonalBuff(event) {
    console.log('primary', event);
  }

  applySecondaryBuff(event) {
    console.log('secondary', event);
  }

  /* TODO:
      The mastery you get from your own buff
      The stats you get from other people dying
      The stats you give when other people die
   */
  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.LOYAL_TO_THE_END.id}
        value={(
          <>
            <MasteryIcon /> {formatNumber(this.personalMasteryValue)} <small>average Mastery gained</small><br />
          </>
        )}
        tooltip={``}
      />
    );
  }
}

export default LoyalToTheEnd;
