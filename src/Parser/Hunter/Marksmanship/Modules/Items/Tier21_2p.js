import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import getDamageBonus from "Parser/Hunter/Shared/Modules/getDamageBonus";
import { formatNumber, formatPercentage } from 'common/format';

const T21_2P_DMG_BONUS = 0.3;

const debug = true;

class Tier20_2p extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  focusGeneratorCasts = {
    [SPELLS.ARCANE_SHOT_FOCUSMODULE.id]: {
      casts: 0,
      baselineFocusGain: 8,
      actualGain: 0,
    },

    [SPELLS.MULTISHOT_FOCUSMODULE.id]: {
      casts: 0,
      baselineFocusGain: 3,
      actualGain: 0,
    },

    [SPELLS.SIDEWINDERS_TALENT.id]: {
      casts: 0,
      baselineFocusGain: 35,
      actualGain: 0,
    },
  };
  damageFromGenerators = {
    [SPELLS.MULTISHOT.id]: {
      bonusDmg: 0,
    },
    [SPELLS.ARCANE_SHOT.id]: {
      bonusDmg: 0,
    },
    [SPELLS.SIDEWINDERS_TALENT.id]: {
      bonusDmg: 0,
    },
  };

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.HUNTER_MM_T21_2P_BONUS.id);
  }

  on_byPlayer_energize(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MULTISHOT_FOCUSMODULE.id && spellId !== SPELLS.ARCANE_SHOT_FOCUSMODULE.id && spellId !== SPELLS.SIDEWINDERS_TALENT.id) {
      return false;
    }
    this.focusGeneratorCasts[spellId].casts += 1;
    this.focusGeneratorCasts[spellId].actualGain += (event.resourceChange - event.waste);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MULTISHOT.id && spellId !== SPELLS.ARCANE_SHOT.id && spellId !== SPELLS.SIDEWINDERS_TALENT.id) {
      return false;
    }
    this.damageFromGenerators[spellId].bonusDmg += getDamageBonus(event, T21_2P_DMG_BONUS);
  }
  get arcaneBonusDamage() {
    return this.damageFromGenerators[SPELLS.ARCANE_SHOT.id].bonusDmg;
  }
  get arcaneActualFocusGain() {
    return this.focusGeneratorCasts[SPELLS.ARCANE_SHOT_FOCUSMODULE.id].actualGain - (this.focusGeneratorCasts[SPELLS.ARCANE_SHOT_FOCUSMODULE.id].casts * this.focusGeneratorCasts[SPELLS.ARCANE_SHOT_FOCUSMODULE.id].baselineFocusGain);
  }
  get arcanePotentialFocusGain() {
    return ((this.focusGeneratorCasts[SPELLS.ARCANE_SHOT_FOCUSMODULE.id].casts * (this.focusGeneratorCasts[SPELLS.ARCANE_SHOT_FOCUSMODULE.id].baselineFocusGain * 1.25)) / 5);
  }
  get multiBonusDamage() {
    return this.damageFromGenerators[SPELLS.MULTISHOT.id].bonusDmg;
  }
  get multiActualFocusGain() {
    return this.focusGeneratorCasts[SPELLS.MULTISHOT_FOCUSMODULE.id].actualGain - (this.focusGeneratorCasts[SPELLS.MULTISHOT_FOCUSMODULE.id].casts * this.focusGeneratorCasts[SPELLS.MULTISHOT_FOCUSMODULE.id].baselineFocusGain);
  }
  get multiPotentialFocusGain() {
    return ((this.focusGeneratorCasts[SPELLS.MULTISHOT_FOCUSMODULE.id].casts * (this.focusGeneratorCasts[SPELLS.MULTISHOT_FOCUSMODULE.id].baselineFocusGain * 1.25)) / 5);
  }
  get sidewindersBonusDamage() {
    return this.damageFromGenerators[SPELLS.SIDEWINDERS_TALENT.id].bonusDmg;
  }
  get sidewindersActualFocusGain() {
    return this.focusGeneratorCasts[SPELLS.SIDEWINDERS_TALENT.id].actualGain - (this.focusGeneratorCasts[SPELLS.SIDEWINDERS_TALENT.id].casts * this.focusGeneratorCasts[SPELLS.SIDEWINDERS_TALENT.id].baselineFocusGain);
  }
  get sidewindersPotentialFocusGain() {
    return ((this.focusGeneratorCasts[SPELLS.SIDEWINDERS_TALENT.id].casts * (this.focusGeneratorCasts[SPELLS.SIDEWINDERS_TALENT.id].baselineFocusGain * 1.25)) / 5);
  }

  item() {
    let totalDamageIncrease = 0;
    let totalPotentialFocusGain = 0;
    let totalExtraFocusGenerated = 0;

    const damageAbilities = [[SPELLS.MULTISHOT.id], [SPELLS.ARCANE_SHOT.id], [SPELLS.SIDEWINDERS_TALENT.id]];
    const generatingAbilities = [[SPELLS.MULTISHOT_FOCUSMODULE.id], [SPELLS.ARCANE_SHOT_FOCUSMODULE.id], [SPELLS.SIDEWINDERS_TALENT.id]];

    damageAbilities.map(ability => totalDamageIncrease += this.damageFromGenerators[ability].bonusDmg);

    generatingAbilities.map(ability => totalExtraFocusGenerated += this.focusGeneratorCasts[ability].actualGain - (this.focusGeneratorCasts[ability].baselineFocusGain * this.focusGeneratorCasts[ability].casts));

    generatingAbilities.map(ability => totalPotentialFocusGain += ((this.focusGeneratorCasts[ability].casts * (this.focusGeneratorCasts[ability].baselineFocusGain * 1.25)) / 5));

    let tooltipText = `This shows a breakdown of T21 <ul>`;
    tooltipText += this.arcaneBonusDamage > 0 ? `<li>Arcane Shot: <ul><li>Damage gain: ${formatNumber(this.arcaneBonusDamage)}</li><li>Focus gain: ${formatNumber(this.arcaneActualFocusGain)} out of ${this.arcanePotentialFocusGain} possible</li></ul></li>` : '';
    tooltipText += this.multiBonusDamage > 0 ? `<li>Multishot: <ul><li>Damage gain: ${formatNumber(this.multiBonusDamage)}</li><li>Focus gain: ${formatNumber(this.multiActualFocusGain)} out of ${this.multiPotentialFocusGain} possible</li></ul></li>` : '';
    tooltipText += this.sidewindersBonusDamage > 0 ? `<li>Sidewinders: <ul><li>Damage gain: ${formatNumber(this.sidewindersBonusDamage)}</li><li>Focus gain: ${formatNumber(this.sidewindersActualFocusGain)} out of ${this.sidewindersPotentialFocusGain} possible</li></ul></li>` : '';
    tooltipText += `</ul>`;
    return {
      id: `spell-${SPELLS.HUNTER_MM_T21_2P_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.HUNTER_MM_T21_2P_BONUS.id} />,
      title: <SpellLink id={SPELLS.HUNTER_MM_T21_2P_BONUS.id} />,
      result: (
        <dfn data-tip={tooltipText}
        >
          Focus gain: {totalExtraFocusGenerated} / {totalPotentialFocusGain} possible
          <br />
          {formatNumber(totalDamageIncrease)} damage - {this.owner.formatItemDamageDone(totalDamageIncrease)}
        </dfn>
      ),
    };
  }
}

export default Tier20_2p;
