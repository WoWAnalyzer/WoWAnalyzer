import React from 'react';
import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import { formatThousands } from 'common/format';
import Events from 'parser/core/Events';

//Worms last 15 sec. But sometimes lag and such makes them expire a little bit early.
const WORMLIFESPAN = 14900;
class Bloodworms extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  totalSummons=0;
  totalHealing=0;
  totalDamage=0;
  poppedEarly=0;
  wormID=0;

  bloodworm = [];


  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BLOODWORMS_TALENT.id);
    this.addEventListener(Events.summon.by(SELECTED_PLAYER).spell(SPELLS.BLOODWORM), this.onSummon);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onDamage);
    this.addEventListener(Events.instakill.by(SELECTED_PLAYER_PET).spell(SPELLS.BLOODWORM_DEATH), this.onInstakill);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER).spell(SPELLS.BLOODWORM_DEATH), this.onHeal);
  }

  poppedWorms(bloodworm) {
    return bloodworm.filter(e => e.killedTime - e.summonedTime <= WORMLIFESPAN).length;
  }

  onSummon(event) {
    this.bloodworm.push({
      uniqueID: event.targetInstance,
      summonedTime: event.timestamp,
    });
    this.totalSummons+= 1;
    this.wormID = event.targetID;
  }

  onDamage(event) {
    if (event.sourceID !== this.wormID) {
      return;
    }
    this.totalDamage += event.amount + (event.absorbed || 0);
  }


  onInstakill(event) {
    let index = -1;
    this.bloodworm.forEach((e, i) => {
      if (e.uniqueID === event.targetInstance) {
        index = i;
      }
    });

    if (index === -1) {
      return;
    }
    this.bloodworm[index].killedTime = event.timestamp;
  }

  onHeal(event) {
    this.totalHealing+= (event.amount || 0) + (event.absorbed || 0);
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.BLOODWORMS_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(6)}
        value={this.owner.formatItemHealingDone(this.totalHealing)}
        label="Bloodworm Stats"
        tooltip={(
          <>
            <strong>Damage:</strong> {formatThousands(this.totalDamage)} / {this.owner.formatItemDamageDone(this.totalDamage)}<br />
            <strong>Number of worms summoned:</strong> {this.totalSummons}<br />
            <strong>Number of worms popped early:</strong> {this.poppedWorms(this.bloodworm)}
          </>
        )}
      />
    );
  }
}

export default Bloodworms;
