import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import getDamageBonus from 'Parser/Hunter/Shared/Modules/getDamageBonus';
import ItemDamageDone from 'Main/ItemDamageDone';

const T21_2P_DMG_BONUS = 0.3;

/**
 * Your Focus generating attacks deal 30% more damage and generate 25% more Focus.
 */
class Tier21_2p extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  focusGeneratorCasts = {
    [SPELLS.ARCANE_SHOT_FOCUSMODULE.id]: {
      casts: 0,
      baselineFocusGain: 8,
      actualGain: 0,
      potentialGain: 0,
    },

    [SPELLS.MULTISHOT_FOCUSMODULE.id]: {
      casts: 0,
      baselineFocusGain: 3,
      actualGain: 0,
      potentialGain: 0,
    },

    [SPELLS.SIDEWINDERS_TALENT.id]: {
      casts: 0,
      baselineFocusGain: 35,
      actualGain: 0,
      potentialGain: 0,
    },
  };
  damageFromGenerators = {
    [SPELLS.MULTISHOT.id]: {
      bonusDmg: 0,
    },
    [SPELLS.ARCANE_SHOT.id]: {
      bonusDmg: 0,
    },
    [SPELLS.SIDEWINDERS_DAMAGE.id]: {
      bonusDmg: 0,
    },
  };

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.HUNTER_MM_T21_2P_BONUS.id);
  }

  on_byPlayer_energize(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MULTISHOT_FOCUSMODULE.id && spellId !== SPELLS.ARCANE_SHOT_FOCUSMODULE.id && spellId !== SPELLS.SIDEWINDERS_TALENT.id) {
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
    if (spellId !== SPELLS.MULTISHOT.id && spellId !== SPELLS.ARCANE_SHOT.id && spellId !== SPELLS.SIDEWINDERS_DAMAGE.id) {
      return;
    }
    this.damageFromGenerators[spellId].bonusDmg += getDamageBonus(event, T21_2P_DMG_BONUS);
  }
  get arcaneBonusDamage() {
    return this.damageFromGenerators[SPELLS.ARCANE_SHOT.id].bonusDmg;
  }
  get arcaneActualFocusGain() {
    return this.focusGeneratorCasts[SPELLS.ARCANE_SHOT_FOCUSMODULE.id].actualGain;
  }
  get arcanePotentialFocusGain() {
    return this.focusGeneratorCasts[SPELLS.ARCANE_SHOT_FOCUSMODULE.id].potentialGain;
  }
  get multiBonusDamage() {
    return this.damageFromGenerators[SPELLS.MULTISHOT.id].bonusDmg;
  }
  get multiActualFocusGain() {
    return this.focusGeneratorCasts[SPELLS.MULTISHOT_FOCUSMODULE.id].actualGain;
  }
  get multiPotentialFocusGain() {
    return this.focusGeneratorCasts[SPELLS.MULTISHOT_FOCUSMODULE.id].potentialGain;
  }
  get sidewindersBonusDamage() {
    return this.damageFromGenerators[SPELLS.SIDEWINDERS_DAMAGE.id].bonusDmg;
  }
  get sidewindersActualFocusGain() {
    return this.focusGeneratorCasts[SPELLS.SIDEWINDERS_TALENT.id].actualGain;
  }
  get sidewindersPotentialFocusGain() {
    return this.focusGeneratorCasts[SPELLS.SIDEWINDERS_TALENT.id].potentialGain;
  }

  item() {
    const damageAbilities = [[SPELLS.MULTISHOT.id], [SPELLS.ARCANE_SHOT.id], [SPELLS.SIDEWINDERS_DAMAGE.id]];
    const generatingAbilities = [[SPELLS.MULTISHOT_FOCUSMODULE.id], [SPELLS.ARCANE_SHOT_FOCUSMODULE.id], [SPELLS.SIDEWINDERS_TALENT.id]];

    const totalDamageIncrease = damageAbilities.reduce((total, ability) => total + this.damageFromGenerators[ability].bonusDmg, 0);
    const totalExtraFocusGenerated = generatingAbilities.reduce((total, ability) => total + this.focusGeneratorCasts[ability].actualGain, 0);
    const totalPotentialFocusGain = generatingAbilities.reduce((total, ability) => total + this.focusGeneratorCasts[ability].potentialGain, 0);

    let tooltipText = `This shows a breakdown of T21 <ul>`;
    tooltipText += (this.arcaneBonusDamage > 0 || this.arcanePotentialFocusGain > 0) ? `<li>Arcane Shot: <ul><li>Damage gain: ${formatNumber(this.arcaneBonusDamage)}</li><li>Focus gain: ${formatNumber(this.arcaneActualFocusGain)} out of ${formatNumber(this.arcanePotentialFocusGain)} possible</li></ul></li>` : '';
    tooltipText += (this.multiBonusDamage > 0 || this.multiPotentialFocusGain > 0) ? `<li>Multishot: <ul><li>Damage gain: ${formatNumber(this.multiBonusDamage)}</li><li>Focus gain: ${formatNumber(this.multiActualFocusGain)} out of ${formatNumber(this.multiPotentialFocusGain)} possible</li></ul></li>` : '';
    tooltipText += (this.sidewindersBonusDamage > 0 || this.sidewindersPotentialFocusGain > 0) ? `<li>Sidewinders: <ul><li>Damage gain: ${formatNumber(this.sidewindersBonusDamage)}</li><li>Focus gain: ${formatNumber(this.sidewindersActualFocusGain)} out of ${formatNumber(this.sidewindersPotentialFocusGain)} possible</li></ul></li>` : '';
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
