import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import { formatNumber } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import StatWeights from '../../Features/StatWeights';
import {getPrimaryStatForItemLevel, findItemLevelByPrimaryStat} from '../AzeriteTraits/common';

/**
 When Innervate expires, your Intellect is increased by 77 for each spell the target cast using Innervate. Lasts 20 sec.
 TODO - The implementation of this can be more sophisticated, i.e. calculating the actual gain per heal occurring during lively spirit.
 TODO - Assumes that the druid cast innervate on themselves, is it possible to track this for targetId as well or tracking the int buff in any other way? :thinking:
 */

const LIVELY_SPIRIT_DURATION = 20000;
const INNERVATE_DURATION = 12000;

class LivelySpirit extends Analyzer{
  static dependencies = {
    statWeights: StatWeights,
  };

  ABILITIES_BUFFING_LIVELY_SPIRIT = [
    SPELLS.REJUVENATION.id,
    SPELLS.REGROWTH.id,
    SPELLS.WILD_GROWTH.id,
    SPELLS.TRANQUILITY_CAST.id,
    SPELLS.CENARION_WARD_TALENT.id,
    SPELLS.LIFEBLOOM_HOT_HEAL.id,
    SPELLS.SWIFTMEND.id,
    SPELLS.EFFLORESCENCE_CAST.id,
    SPELLS.MOONFIRE.id,
    SPELLS.SOLAR_WRATH.id,
    SPELLS.SUNFIRE.id,
    SPELLS.NATURES_CURE.id,
  ];

  intGain = 0;
  avgItemLevel = 0;
  traitLevel = 0;
  // You always get 1 stack per default
  castsDuringInnervate = 1;
  intGainPerSpell = 0;
  livelySpirits = [];
  innervateTimestamp = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.LIVELY_SPIRIT_TRAIT.id);
    if(this.active) {
      this.avgItemLevel = this.selectedCombatant.traitsBySpellId[SPELLS.LIVELY_SPIRIT_TRAIT.id]
        .reduce((a, b) => a + b) / this.selectedCombatant.traitsBySpellId[SPELLS.LIVELY_SPIRIT_TRAIT.id].length;
      this.traitLevel = this.selectedCombatant.traitsBySpellId[SPELLS.LIVELY_SPIRIT_TRAIT.id].length;
      this.intGainPerSpell = this.selectedCombatant.traitsBySpellId[SPELLS.LIVELY_SPIRIT_TRAIT.id]
        .reduce((sum, rank) => sum + calculateAzeriteEffects(SPELLS.LIVELY_SPIRIT_TRAIT.id, rank)[0], 0);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(SPELLS.INNERVATE.id === spellId && event.sourceId === event.targetId) {
      this.innervateTimestamp = event.timestamp;
    }

    if (this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)
          && this.ABILITIES_BUFFING_LIVELY_SPIRIT.includes(spellId)
          && this.innervateTimestamp !== 0
          && (this.innervateTimestamp+INNERVATE_DURATION) >= event.timestamp) {
      this.castsDuringInnervate++;
    }
  }

  on_toPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.LIVELY_SPIRIT_BUFF.id === spellId) {
      this.livelySpirits.push(this.intGainPerSpell * this.castsDuringInnervate);
      this.castsDuringInnervate = 1;
      this.innervateTimestamp = 0;
    }
  }

  statistic(){
    this.livelySpirits.forEach(
      function (element) {
        this.intGain += element * (LIVELY_SPIRIT_DURATION / this.owner.fightDuration);
      }, this);
    const ilvlGain = findItemLevelByPrimaryStat(getPrimaryStatForItemLevel(this.avgItemLevel) + this.intGain) - this.avgItemLevel;

    return(
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.LIVELY_SPIRIT_TRAIT.id}
        value={(
          <React.Fragment>
            {formatNumber(this.intGain)} average Intellect gained.<br />
          </React.Fragment>
        )}
        tooltip={`This assumes that you cast your innervates on yourself. <br />
                  This only shows average int gained from using this trait and not how much your heals actually benefited from the int gain.  <br />
                  This is worth roughly <b>${formatNumber(ilvlGain)}</b> (${formatNumber(ilvlGain/this.traitLevel)} per level) item levels.`}
      />
    );
  }
}

export default LivelySpirit;
