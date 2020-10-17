import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatNumber, formatThousands } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';

import StatWeights from '../../features/StatWeights';
import Events from 'parser/core/Events';

/**
 When Innervate expires, for each spell the target cast using Innervate, you gain 54 Intellect for 20 sec and 0.5% mana.
 TODO - The implementation of this can be more sophisticated, i.e. calculating the actual gain per heal occurring during lively spirit.
 TODO - Assumes that the druid cast innervate on themselves, is it possible to track this for targetId as well or tracking the int buff in any other way? :thinking:
 */

const LIVELY_SPIRIT_DURATION = 20000;
const INNERVATE_DURATION = 12000;

class LivelySpirit extends Analyzer {
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
  manaGained = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.LIVELY_SPIRIT_TRAIT.id);
    if (this.active) {
      this.avgItemLevel = this.selectedCombatant.traitsBySpellId[SPELLS.LIVELY_SPIRIT_TRAIT.id]
        .reduce((a, b) => a + b) / this.selectedCombatant.traitsBySpellId[SPELLS.LIVELY_SPIRIT_TRAIT.id].length;
      this.traitLevel = this.selectedCombatant.traitsBySpellId[SPELLS.LIVELY_SPIRIT_TRAIT.id].length;
      this.intGainPerSpell = this.selectedCombatant.traitsBySpellId[SPELLS.LIVELY_SPIRIT_TRAIT.id]
        .reduce((sum, rank) => sum + calculateAzeriteEffects(SPELLS.LIVELY_SPIRIT_TRAIT.id, rank)[0], 0);
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.LIVELY_SPIRIT_BUFF), this.onRemoveBuff);
    this.addEventListener(Events.energize.to(SELECTED_PLAYER).spell(SPELLS.LIVELY_SPIRIT_MANA_RETURN), this.onEnergize);
  }

  onCast(event) {
    const spellId = event.ability.guid;

    if (SPELLS.INNERVATE.id === spellId && event.sourceId === event.targetId) {
      this.innervateTimestamp = event.timestamp;
    }

    if (this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)
      && this.ABILITIES_BUFFING_LIVELY_SPIRIT.includes(spellId)
      && this.innervateTimestamp !== 0
      && (this.innervateTimestamp + INNERVATE_DURATION) >= event.timestamp) {
      this.castsDuringInnervate += 1;
    }
  }

  onRemoveBuff(event) {
    this.livelySpirits.push(this.intGainPerSpell * this.castsDuringInnervate);
    this.castsDuringInnervate = 1;
    this.innervateTimestamp = 0;
  }

  onEnergize(event) {
    this.manaGained += event.resourceChange;
  }

  statistic() {
    if(this.intGain === 0) { // statistic ctor called on tab switch, only sum int gain first time
      this.livelySpirits.forEach(function (element) {
        this.intGain += element * (LIVELY_SPIRIT_DURATION / this.owner.fightDuration);
      }, this);
    }

    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.LIVELY_SPIRIT_TRAIT.id}
        value={(
          <>
            {formatNumber(this.intGain)} <small>average Intellect gained</small><br />
            {formatThousands(this.manaGained)} <small>mana gained</small>
          </>
        )}
        tooltip={(
          <>
            This assumes that you cast your innervates on yourself.<br />
            This only shows average int gained from using this trait and not how much your heals actually benefited from the int gain.
          </>
        )}
      />
    );
  }
}

export default LivelySpirit;
