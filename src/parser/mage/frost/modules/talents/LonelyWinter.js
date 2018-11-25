import React from 'react';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import Analyzer from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import Events from 'parser/core/Events';
import { formatNumber } from 'common/format';

const BONUS = 0.25;
const AFFECTED_SPELLS = [
  SPELLS.FROSTBOLT_DAMAGE,
  SPELLS.ICE_LANCE_DAMAGE,
  SPELLS.FLURRY_DAMAGE,
];

// You can no longer summon your Water Elemental, but Frostbolt, Ice Lance, and Flurry deal 25% increased damage.
class LonelyWinter extends Analyzer {

  bonusDamage = {};

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.LONELY_WINTER_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(AFFECTED_SPELLS), this.onAffectedDamage);
    AFFECTED_SPELLS.forEach(spell => { this.bonusDamage[spell.id] = 0; });
  }

  onAffectedDamage(event) {
    this.bonusDamage[event.ability.guid] += calculateEffectiveDamage(event, BONUS);
  }

  statistic() {
    let totalDamage = 0;
    let tooltip = "When analyzing this talent, take into account any DPS you lost by not having a Water Elemental.";
    tooltip += Object.keys(this.bonusDamage).reduce((acc, spellId) => {
      const spellBonus = this.bonusDamage[spellId];
      totalDamage += spellBonus;
      return acc + `<li>Bonus <b>${SPELLS[spellId].name}</b> damage: ${formatNumber(spellBonus)}</li>`;
    }, '<ul>');
    tooltip += `</ul>Total damage increase: ${formatNumber(totalDamage)}`;

    return (
      <TalentStatisticBox
        talent={SPELLS.LONELY_WINTER_TALENT.id}
        value={this.owner.formatItemDamageDone(totalDamage)}
        tooltip={tooltip}
      />
    );
  }

}

export default LonelyWinter;
