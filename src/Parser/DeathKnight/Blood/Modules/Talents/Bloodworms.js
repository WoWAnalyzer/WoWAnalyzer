import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellIcon from 'common/SpellIcon';
import { formatThousands } from 'common/format';

class Bloodworms extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };

  totalSummons=0;
  totalHealing=0;
  totalDamage=0;
  sourceInstance=0;


  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.BLOODWORMS_TALENT.id);
  }

  on_byPlayer_summon(event) {
    if (event.ability.guid === SPELLS.BLOODWORM.id) {
      console.log("Worm Summoned ", this.wormID);
      this.totalSummons+= 1;
      this.wormID = event.targetID;
      this.sourceInstance = event.targetInstance;
    }
  }

  on_byPlayerPet_damage(event) {
    if (event.sourceID === this.wormID) {
      this.totalDamage += event.amount + (event.absorbed || 0);
      console.log("Worm Damage ", this.sourceInstance);
    }
  }

  on_byPlayer_instakill(event) {
    if (event.ability.guid !== SPELLS.BLOODWORM_DEATH.id) {
      return;
    }
    this.impsKilled += 1;
  }

  on_toPlayer_heal(event) {
    if (event.ability.guid === SPELLS.BLOODWORM_DEATH.id) {
      console.log("Worm Heal ");
      this.totalHealing+= (event.amount || 0) + (event.absorbed || 0);
    }
  }


  statistic() {
    return (

      <StatisticBox
        icon={<SpellIcon id={SPELLS.BLOODWORMS_TALENT.id} />}
        value={this.owner.formatItemHealingDone(this.totalHealing)}
        label="Bloodworm Stats"
        tooltip={`<strong>Damage:</strong> ${formatThousands(this.totalDamage)} / ${this.owner.formatItemDamageDone(this.totalDamage)}<br>
        <strong>Number of worms summoned:</strong> ${this.totalSummons}<br>
        `}
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default Bloodworms;
