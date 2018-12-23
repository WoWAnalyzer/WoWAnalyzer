import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import { BLOODSEEKER_ATTACK_SPEED_GAIN } from 'parser/hunter/survival/constants';
import { formatPercentage } from 'common/format';
import ItemDamageDone from 'interface/others/ItemDamageDone';

/**
 * Kill Command causes the target to bleed for X damage over 8 sec.
 * You and your pet gain 10% attack speed for every bleeding enemy within 12 yds.
 *
 * Example log: https://www.warcraftlogs.com/reports/WBkTFfP6G4VcxjLz#fight=1&type=auras&source=8&ability=260249
 */

const MS_BUFFER = 100;

class Bloodseeker extends Analyzer {

  averageStacks = 0;
  kcCastTimestamp = null;
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BLOODSEEKER_TALENT.id);
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.KILL_COMMAND_DAMAGE_SV.id) {
      return;
    }
    if (event.timestamp > (this.kcCastTimestamp + MS_BUFFER)) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.KILL_COMMAND_CAST_SV.id) {
      return;
    }
    this.kcCastTimestamp = event.timestamp;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.BLOODSEEKER_BUFF.id) / this.owner.fightDuration;
  }

  get averageAttackSpeedGain() {
    this.averageStacks = this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.BLOODSEEKER_BUFF.id) / this.owner.fightDuration;
    return this.averageStacks * BLOODSEEKER_ATTACK_SPEED_GAIN;
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.BLOODSEEKER_TALENT.id}
        value={<>
          <ItemDamageDone amount={this.damage} /> <br />
          {formatPercentage(this.averageAttackSpeedGain)}% atk speed gain
        </>}
        tooltip={`You had ${formatPercentage(this.uptime)}% uptime on the buff, with an average of ${(this.averageStacks).toFixed(2)} stacks.`}
      />
    );
  }

}

export default Bloodseeker;
