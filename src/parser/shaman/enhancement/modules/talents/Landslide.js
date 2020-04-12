import React from 'react';
import SPELLS from 'common/SPELLS/index';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';

import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

const LANDSLIDE_DAMAGE_MODIFIER = 1.0;

class Landslide extends Analyzer {

  damageGained = 0;
  procCount = 0;
  procUses = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.LANDSLIDE_TALENT.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid!==SPELLS.STORMSTRIKE_CAST.id) {
      return;
    }

    if (!this.selectedCombatant.hasBuff(SPELLS.LANDSLIDE_BUFF.id)){
      return;
    }

    this.procUses++;
  }

  on_byPlayer_applybuff(event) {
    if (event.ability.guid!==SPELLS.LANDSLIDE_BUFF.id){
      return;
    }

    this.procCount++;
  }

  on_byPlayer_refreshbuff(event) {
    if (event.ability.guid!==SPELLS.LANDSLIDE_BUFF.id) {
      return;
    }

    this.procCount++;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.STORMSTRIKE_ATTACK.id &&
      event.ability.guid !== SPELLS.STORMSTRIKE_ATTACK_OFFHAND.id) {
      return;
    }

    if (!this.selectedCombatant.hasBuff(SPELLS.LANDSLIDE_BUFF.id)) {
      return;
    }

    this.damageGained += calculateEffectiveDamage(event, LANDSLIDE_DAMAGE_MODIFIER);
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damageGained);
  }

  get damagePerSecond() {
    return this.damageGained / this.owner.fightDuration * 1000;
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.LANDSLIDE_TALENT.id}
        value={`${formatPercentage(this.damagePercent)} %`}
        label="Landslide Contribution"
        tooltip={<>
          Contributed {formatNumber(this.damagePerSecond)} DPS ({formatNumber(this.damageGained)} total damage). <br />
          You've used <strong>{this.procUses}</strong> out of <strong>{this.procCount}</strong> total procs.
        </>}
      />
    );
  }
}

export default Landslide;
