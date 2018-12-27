import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import ResourceIcon from 'common/ResourceIcon';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import ItemDamageDone from 'interface/others/ItemDamageDone';

/**
 * Summons a powerful wild beast that attacks the target and roars, increasing your Haste by 5% for 8 sec.
 *
 * Example log: https://www.warcraftlogs.com/reports/jV7BJPN81AqtDKYp#fight=9&source=167&type=damage-done
 */

const HASTE_PERCENT = 0.05;
const SCENT_OF_BLOOD_FOCUS_INCREASE = 2;
const BASELINE_DIRE_BEAST_REGEN = 10;

class DireBeast extends Analyzer {

  focusGained = 0;
  focusWasted = 0;
  damage = 0;
  activeDireBeasts = [];
  targetId = null;
  hasSoB = false;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DIRE_BEAST_TALENT.id);
    this.hasSoB = this.selectedCombatant.hasTalent(SPELLS.SCENT_OF_BLOOD_TALENT.id);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.DIRE_BEAST_BUFF.id) / this.owner.fightDuration;
  }

  on_toPlayer_energize(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DIRE_BEAST_GENERATOR.id) {
      return;
    }
    console.log(event.waste);
    if (!this.hasSoB) {
      this.focusGained += event.resourceChange - event.waste;
      this.focusWasted += event.waste;
      return;
    }
    if (event.waste <= BASELINE_DIRE_BEAST_REGEN) { //We waste less than the baseline regen, so we can subtract the Scent of Blood bonus
      this.focusGained += event.resourceChange - event.waste - SCENT_OF_BLOOD_FOCUS_INCREASE;
    }
    if (event.waste >= SCENT_OF_BLOOD_FOCUS_INCREASE) {
      this.focusWasted += event.waste - SCENT_OF_BLOOD_FOCUS_INCREASE;
    }
  }

  on_byPlayerPet_damage(event) {
    const sourceId = encodeTargetString(event.sourceID, event.sourceInstance);
    if (this.activeDireBeasts.includes(sourceId)) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  on_byPlayer_summon(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DIRE_BEAST_SECONDARY_WITH_SCENT.id && spellId !== SPELLS.DIRE_BEAST_SECONDARY_WITHOUT_SCENT.id) {
      return;
    }
    this.targetId = encodeTargetString(event.targetID, event.targetInstance);
    this.activeDireBeasts = [];
    this.activeDireBeasts.push(this.targetId);
    this.targetId = null;
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.DIRE_BEAST_TALENT.id}
        value={
          <>
            <ItemDamageDone amount={this.damage} /> <br />
            gained {formatPercentage(HASTE_PERCENT * this.uptime)}% haste <br />
            gained {this.focusGained} focus <ResourceIcon id={RESOURCE_TYPES.FOCUS.id} />
          </>}
        tooltip={`
            You had ${formatPercentage(this.uptime)}% uptime on the Dire Beast haste buff. <br />
            You wasted ${this.focusWasted} focus by being too close to focus cap when Dire Beast gave you focus.`}
      />
    );
  }

}

export default DireBeast;
