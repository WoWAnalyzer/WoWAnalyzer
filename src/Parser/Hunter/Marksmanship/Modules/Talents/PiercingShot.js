import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from "common/SpellIcon";
import { formatPercentage } from "common/format";
import SpellLink from "common/SpellLink";
import ItemDamageDone from 'Main/ItemDamageDone';
import Wrapper from 'common/Wrapper';

/*
 * A powerful shot which deals up to (2 * 775%) Physical damage to the target and up to 775% Physical damage to all enemies between you and the target.
 * Damage increased against targets with Vulnerable.
 */
class PiercingShot extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,

  };
  damage = 0;
  inVulnerablePiercing = 0;
  totalPiercing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.PIERCING_SHOT_TALENT.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.PIERCING_SHOT_TALENT.id) {
      return;
    }
    const enemy = this.enemies.getEntity(event);
    if (enemy.hasBuff(SPELLS.VULNERABLE.id, event.timestamp)) {
      this.inVulnerablePiercing += 1;
    }
    this.totalPiercing += 1;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PIERCING_SHOT_TALENT.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }
  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.PIERCING_SHOT_TALENT.id}>
            <SpellIcon id={SPELLS.PIERCING_SHOT_TALENT.id} noLink /> Piercing Shot
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.damage} />
        </div>
      </div>
    );
  }
  suggestions(when) {
    const percentPiercingInsideVulnerability = this.inVulnerablePiercing / this.totalPiercing;
    when(percentPiercingInsideVulnerability).isLessThan(1)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>You should be casting all of your <SpellLink id={SPELLS.PIERCING_SHOT_TALENT.id} />s inside <SpellLink id={SPELLS.VULNERABLE.id} /> to ensure it does the most damage it possible can. </Wrapper>)
          .icon(SPELLS.PIERCING_SHOT_TALENT.icon)
          .actual(`${formatPercentage(1 - percentPiercingInsideVulnerability)}% were outside Vulnerable`)
          .recommended(`${formatPercentage(recommended)}% of total Piercing Shots inside Vulnerable is recommended`)
          .major(true);
      });
  }
}

export default PiercingShot;
