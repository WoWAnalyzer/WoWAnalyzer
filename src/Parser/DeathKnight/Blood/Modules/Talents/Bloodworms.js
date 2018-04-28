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
  poppedEarly=0;

  bloodworm = [];


  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.BLOODWORMS_TALENT.id);
  }

  poppedWorms(bloodworm) {
    console.log(bloodworm);
    const popped = bloodworm.filter(e => {
      console.log(e.killedTime - e.summonedTime);
      return e.killedTime - e.summonedTime <= 15000
    });
    return popped.length;
  }

  on_byPlayer_summon(event) {
    if (event.ability.guid === SPELLS.BLOODWORM.id) {
      this.bloodworm.push({
        uniqueID: event.targetInstance,
        summonedTime: event.timestamp,
      });
      this.totalSummons+= 1;
    }
  }

  on_byPlayerPet_damage(event) {
    if (event.sourceID === this.wormID) {
      this.totalDamage += event.amount + (event.absorbed || 0);
      console.log("Worm Damage ", this.sourceInstance);
    }
  }

  on_byPlayerPet_instakill(event) {
    if (event.ability.guid === SPELLS.BLOODWORM_DEATH.id) {
      let index = -1;
      this.bloodworm.forEach((e, i) => {
        if (e.uniqueID === event.targetInstance) {
          index = i;
        }
      });

      if (index === -1) {
        console.log("Death of unknown Bloodworm");
        return;
      }
      console.log("index    ", index);
      this.bloodworm[index].killedTime = event.timestamp;
    }
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
        <strong># of worms popped early:</strong> ${this.poppedWorms(this.bloodworms)}
        `}
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default Bloodworms;
