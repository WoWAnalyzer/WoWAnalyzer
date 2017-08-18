import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import getDamageBonus from '../WarlockCore/getDamageBonus';

const debug = true;

const abilitiesAffected = [
  SPELLS.AGONY.id,
  SPELLS.CORRUPTION_DEBUFF.id,
  SPELLS.SIPHON_LIFE.id,
  SPELLS.UNSTABLE_AFFLICTION_DEBUFF_1.id,
  SPELLS.UNSTABLE_AFFLICTION_DEBUFF_2.id,
  SPELLS.UNSTABLE_AFFLICTION_DEBUFF_3.id,
  SPELLS.UNSTABLE_AFFLICTION_DEBUFF_4.id,
  SPELLS.UNSTABLE_AFFLICTION_DEBUFF_5.id,
];
const MALEFIC_GRASP_DAMAGE_BONUS = .25;

class MaleficGrasp extends Module {
  static dependencies = {
    enemies: Enemies,
  };

  totalBonusDmg = 0;
  agonyBonusDmg = 0;
  corruptionBonusDmg = 0;
  siphonLifeBonusDmg = 0;
  unstableAfflictionBonusDmg = 0;

  on_initialized() {
    if(!this.owner.error){
      this.active = this.owner.selectedCombatant.hasTalent(SPELLS.MALEFIC_GRASP_TALENT.id);
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if(abilitiesAffected.indexOf(spellId) === -1)
      return;
    const target = this.enemies.getEntity(event);
    const buffedByDrain = target.hasBuff(SPELLS.DRAIN_SOUL.id, event.timestamp);
    if(!buffedByDrain)
      return;

    const bonus = getDamageBonus(event, MALEFIC_GRASP_DAMAGE_BONUS); //TODO: confirm on Discord that this is correct
    this.totalBonusDmg += bonus;

    switch(spellId) {
      case SPELLS.AGONY.id:
        this.agonyBonusDmg += bonus;
        break;
      case SPELLS.CORRUPTION_DEBUFF.id:
        this.corruptionBonusDmg += bonus;
        break;
      case SPELLS.SIPHON_LIFE.id:
        this.siphonLifeBonusDmg += bonus;
        break;
      case SPELLS.UNSTABLE_AFFLICTION_DEBUFF_1.id:
      case SPELLS.UNSTABLE_AFFLICTION_DEBUFF_2.id:
      case SPELLS.UNSTABLE_AFFLICTION_DEBUFF_3.id:
      case SPELLS.UNSTABLE_AFFLICTION_DEBUFF_4.id:
      case SPELLS.UNSTABLE_AFFLICTION_DEBUFF_5.id:
        this.unstableAfflictionBonusDmg += bonus;
        break;
      default:
        break;
    }
  }
  on_finished() {
    if(debug) {
      console.log('Bonus agony: ', this.agonyBonusDmg);
      console.log('Bonus corr: ', this.corruptionBonusDmg);
      console.log('Bonus siphon: ', this.siphonLifeBonusDmg);
      console.log('Bonus unstable: ', this.unstableAfflictionBonusDmg);
    }
  }
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.MALEFIC_GRASP_TALENT.id} />}
        value={`${formatNumber(this.totalBonusDmg)}`}
        label={(<dfn data-tip={`Your Malefic Grasp talent contributed ${formatNumber(this.totalBonusDmg)} total damage (${this.owner.formatItemDamageDone(this.totalBonusDmg)}).
          <ul>
          ${this.agonyBonusDmg > 0 ? `
            <li>${formatNumber(this.agonyBonusDmg)} bonus Agony damage.</li>
          `: ""}

          ${this.corruptionBonusDmg > 0 ? `
            <li>${formatNumber(this.corruptionBonusDmg)} bonus Corruption damage.</li>
          `: ""}

          ${this.siphonLifeBonusDmg > 0 ? `
            <li>${formatNumber(this.siphonLifeBonusDmg)} bonus Siphon Life damage.</li>
          `: ""}

          ${this.unstableAfflictionBonusDmg > 0 ? `
            <li>${formatNumber(this.unstableAfflictionBonusDmg)} bonus Unstable Affliction damage.</li>
          `: ""}
          </ul>
        `}>
          Damage contributed
        </dfn>)}
      />
    );
  }
}

export default MaleficGrasp;
