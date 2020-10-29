import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import { formatNumber } from "common/format";
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemHealingDone from 'interface/ItemHealingDone';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Events from 'parser/core/Events';

const MINIMUM_ABSORB_THRESHOLD = 0.05;

class WillOfTheNecropolis extends Analyzer {
  totalWotnAbsorbed = 0;
  currentWotnAbsorbed = 0;
  activated = 0;
  spellDamageId = 0;
  goodAbsorbCount = 0;
  nextEvent = false;


  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.WILL_OF_THE_NECROPOLIS_TALENT.id);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.WILL_OF_THE_NECROPOLIS_TALENT), this.onAbsorbed);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  onAbsorbed(event) {
    this.totalWotnAbsorbed += event.amount;
    this.currentWotnAbsorbed = event.amount;
    this.activated += 1;
    this.spellDamageId = event.extraAbility.guid;
    this.nextEvent = true;
  }

  onDamageTaken(event) {
    const playerHealth = event.maxHitPoints;
    const absorbToHealthPercent = this.currentWotnAbsorbed / playerHealth;
    const spellId = event.ability.guid;
    if (spellId !== this.spellDamageId || this.nextEvent === false) {
      return;
    }
    this.nextEvent = false;
    this.playerHealth = event.maxHitPoints;
    if(absorbToHealthPercent > MINIMUM_ABSORB_THRESHOLD){
      this.goodAbsorbCount += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={(
          <>
            <strong>Total Damage Absorbed: </strong> {formatNumber(this.totalWotnAbsorbed)} <br />
            <strong>Activated: </strong> {this.activated}<br />
            <strong>Absorbed 5% Max Health or more count: </strong> {this.goodAbsorbCount}
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.WILL_OF_THE_NECROPOLIS_TALENT}>
          <>
            <ItemHealingDone amount={this.totalWotnAbsorbed} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WillOfTheNecropolis;
