import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import getDamageBonus from 'Parser/Hunter/Shared/Modules/getDamageBonus';
import ItemDamageDone from 'Main/ItemDamageDone';

const T21_2P_DMG_BONUS = 0.3;

const LIST_OF_FOCUS_GENERATORS = [
  SPELLS.RAPID_FIRE_FOCUS.id,
  SPELLS.STEADY_SHOT_FOCUS.id,
];

const LIST_OF_FOCUS_GENERATING_DAMAGE = [
  SPELLS.RAPID_FIRE_DAMAGE.id,
  SPELLS.STEADY_SHOT.id,
];

/**
 * Your Focus generating attacks deal 30% more damage and generate 25% more Focus.
 */
class Tier21_2p extends Analyzer {
  focusGeneratorCasts = {
    [SPELLS.STEADY_SHOT_FOCUS.id]: {
      casts: 0,
      baselineFocusGain: 8,
      actualGain: 0,
      potentialGain: 0,
    },
    [SPELLS.RAPID_FIRE_FOCUS.id]: {
      casts: 0,
      baselineFocusGain: 8,
      actualGain: 0,
      potentialGain: 0,
    },
  };
  damageFromGenerators = {
    [SPELLS.STEADY_SHOT.id]: {
      bonusDmg: 0,
    },
    [SPELLS.RAPID_FIRE_DAMAGE.id]: {
      bonusDmg: 0,
    },
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasBuff(SPELLS.HUNTER_MM_T21_2P_BONUS.id);
  }

  on_byPlayer_energize(event) {
    const spellId = event.ability.guid;
    if (LIST_OF_FOCUS_GENERATORS.every(id => spellId !== id)) {
      return;
    }
    this.focusGeneratorCasts[spellId].casts += 1;
    //divide by 5 becacuse it's a 25% increase in focus gain - so the potential gain from tier is the resource change / 5.
    this.focusGeneratorCasts[spellId].potentialGain += ((event.resourceChange) / 5);
    //Check to ensure that we don't have negative focus gains in the analyzer. Example scenario:
    //Arcane Shot --> resourceChange = 10, resourceChange * 0.8 = baseline (8 focus), we waste 3 focus, in which case it's below 0 and we gained nothing from the tier.
    //Same scenario but with waste = 0 or 1, and we now have have a gain from the tier.
    this.focusGeneratorCasts[spellId].actualGain += (event.resourceChange - (event.resourceChange * 0.8) - event.waste) > 0 ? (event.resourceChange - event.waste - (event.resourceChange * 0.8)) : 0;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (LIST_OF_FOCUS_GENERATING_DAMAGE.every(id => spellId !== id)) {
      return;
    }

    this.damageFromGenerators[spellId].bonusDmg += getDamageBonus(event, T21_2P_DMG_BONUS);
  }
  get rapidFireBonusDamage() {
    return this.damageFromGenerators[SPELLS.RAPID_FIRE_DAMAGE.id].bonusDmg;
  }
  get rapidFireActualFocusGain() {
    return this.focusGeneratorCasts[SPELLS.RAPID_FIRE_FOCUS.id].actualGain;
  }
  get rapidFirePotentialFocusGain() {
    return this.focusGeneratorCasts[SPELLS.RAPID_FIRE_FOCUS.id].potentialGain;
  }
  get steadyShotBonusDamage() {
    return this.damageFromGenerators[SPELLS.STEADY_SHOT.id].bonusDmg;
  }
  get steadyShotActualFocusGain() {
    return this.focusGeneratorCasts[SPELLS.STEADY_SHOT_FOCUS.id].actualGain;
  }
  get steadyShotPotentialFocusGain() {
    return this.focusGeneratorCasts[SPELLS.STEADY_SHOT_FOCUS.id].potentialGain;
  }

  item() {
    const damageAbilities = [[SPELLS.STEADY_SHOT.id], [SPELLS.RAPID_FIRE_DAMAGE.id]];
    const generatingAbilities = [[SPELLS.STEADY_SHOT_FOCUS.id], [SPELLS.RAPID_FIRE_FOCUS.id]];

    const totalDamageIncrease = damageAbilities.reduce((total, ability) => total + this.damageFromGenerators[ability].bonusDmg, 0);
    const totalExtraFocusGenerated = generatingAbilities.reduce((total, ability) => total + this.focusGeneratorCasts[ability].actualGain, 0);
    const totalPotentialFocusGain = generatingAbilities.reduce((total, ability) => total + this.focusGeneratorCasts[ability].potentialGain, 0);

    let tooltipText = `This shows a breakdown of T21 <ul>`;
    tooltipText += (this.rapidFireBonusDamage > 0 || this.rapidFirePotentialFocusGain > 0) ? `<li>Rapid Fire: <ul><li>Damage gain: ${formatNumber(this.rapidFireBonusDamage)}</li><li>Focus gain: ${formatNumber(this.rapidFireActualFocusGain)} out of ${formatNumber(this.rapidFirePotentialFocusGain)} possible</li></ul></li>` : '';
    tooltipText += (this.steadyShotBonusDamage > 0 || this.steadyShotPotentialFocusGain > 0) ? `<li>Steady Shot: <ul><li>Damage gain: ${formatNumber(this.steadyShotBonusDamage)}</li><li>Focus gain: ${formatNumber(this.steadyShotActualFocusGain)} out of ${formatNumber(this.steadyShotPotentialFocusGain)} possible</li></ul></li>` : '';
    tooltipText += `</ul>`;
    return {
      id: `spell-${SPELLS.HUNTER_MM_T21_2P_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.HUNTER_MM_T21_2P_BONUS.id} />,
      title: <SpellLink id={SPELLS.HUNTER_MM_T21_2P_BONUS.id} icon={false} />,
      result: (
        <dfn data-tip={tooltipText}>
          Focus gain: {formatNumber(totalExtraFocusGenerated)} / {formatNumber(totalPotentialFocusGain)} possible<br />
          <ItemDamageDone amount={totalDamageIncrease} />
        </dfn>
      ),
    };
  }
}

export default Tier21_2p;
