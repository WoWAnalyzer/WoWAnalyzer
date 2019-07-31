import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import Statistic from 'interface/statistics/Statistic';
import { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Haste from 'interface/icons/Haste';

/**
 * Summons a powerful wild beast that attacks the target and roars, increasing your Haste by 5% for 8 sec.
 *
 * Example log: https://www.warcraftlogs.com/reports/qZRdFv9Apg74wmMV#fight=3&type=damage-done
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
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={'TALENTS'}
        tooltip={
          <>
            You had {formatPercentage(this.uptime)}% uptime on the Dire Beast Haste buff. <br />
            You wasted {this.focusWasted} Focus by being too close to Focus cap when Dire Beast gave you Focus.
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.DIRE_BEAST_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} /> <br />
            <Haste /> {formatPercentage(HASTE_PERCENT * this.uptime)}% Haste<br />
            {this.focusGained} <small>focus gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DireBeast;
