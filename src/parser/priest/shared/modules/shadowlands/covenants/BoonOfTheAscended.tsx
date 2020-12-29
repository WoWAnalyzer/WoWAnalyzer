import React from 'react';

import ItemHealingDone from 'interface/ItemHealingDone';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import COVENANTS from 'game/shadowlands/COVENANTS';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

import AtonementDamageSource from 'parser/priest/discipline/modules/features/AtonementDamageSource';
import SPECS from 'game/SPECS';
import ItemDamageDone from 'interface/ItemDamageDone';

// Shadow: https://www.warcraftlogs.com/reports/CdrMAqzkLaKZTVn4#fight=1&type=damage-done&graphperf=1&source=19
// Holy: https://www.warcraftlogs.com/reports/xf7zjvNghdXVRrFT#fight=7&type=healing&graphperf=1&source=18
// Disc: https://www.warcraftlogs.com/reports/FwfkDG87xzV9CWra#fight=17&type=healing&source=14
class BoonOfTheAscended extends Analyzer {
  totalDamage = 0;
  directHealing = 0;
  directOverHealing = 0;
  stackTracker: number[] = [];

  // Disc Specific
  atonementDamageSource: AtonementDamageSource | null = null;
  atonementHealing = 0;
  atonementOverHealing = 0;

  get averageStacks() {
    if (this.stackTracker.length === 0) {
      return 0;
    }

    return this.stackTracker.reduce((a,b) => a + b, 0) / this.stackTracker.length;
  }

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasCovenant(COVENANTS.KYRIAN.id);
    if (!this.active) {
      return;
    }

    if(this.selectedCombatant.spec === SPECS.DISCIPLINE_PRIEST) {
      this.atonementDamageSource = this.owner.getModule(AtonementDamageSource);
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.ASCENDED_BLAST, SPELLS.ASCENDED_NOVA, SPELLS.ASCENDED_ERUPTION]), this.onDamage)
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell([SPELLS.ASCENDED_BLAST_HEAL, SPELLS.ASCENDED_NOVA_HEAL, SPELLS.ASCENDED_ERUPTION_HEAL]), this.onNormalHeal);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell([SPELLS.ATONEMENT_HEAL_NON_CRIT, SPELLS.ATONEMENT_HEAL_CRIT]), this.onAtonmentHeal);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BOON_OF_THE_ASCENDED), this.onBuffRemove);
  }

  onDamage(event: DamageEvent) {
    this.totalDamage += event.amount + (event.absorb || 0);
  }

  onAtonmentHeal(event: HealEvent) {
    if (!this.atonementDamageSource) {
      return;
    }
    const atonenementDamageEvent = this.atonementDamageSource.event;
    if (!atonenementDamageEvent) {
      return;
    }

    if (
      (atonenementDamageEvent.ability.guid !== SPELLS.ASCENDED_BLAST.id &&
        atonenementDamageEvent.ability.guid !== SPELLS.ASCENDED_NOVA.id &&
        atonenementDamageEvent.ability.guid !== SPELLS.ASCENDED_ERUPTION.id)) {
      return;
    }

    this.atonementHealing += event.amount + (event.absorb || 0);
    this.atonementOverHealing += (event.overheal || 0)
  }

  onNormalHeal(event: HealEvent) {
    this.directHealing += event.amount + (event.absorbed || 0);
    this.directOverHealing += (event.overheal || 0);
  }

  onBuffRemove() {
    // This has an accurate buff count until after this event resolves.
    this.stackTracker.push(this.selectedCombatant.getBuffStacks(SPELLS.BOON_OF_THE_ASCENDED.id));
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        tooltip={(
          <>
            Average Boon Stacks: {this.averageStacks}<br />
            Healing Breakdown:
            <ul>
              {this.atonementHealing > 0 && <li>{formatNumber(this.atonementHealing)} Atonement Healing ({formatPercentage(this.atonementOverHealing/(this.atonementOverHealing + this.atonementHealing))} %OH)</li>}
              <li>{formatNumber(this.directHealing)} Direct Healing ({formatPercentage(this.directOverHealing/(this.directOverHealing + this.directHealing))} %OH)</li>
            </ul>
          </>
        )}
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.BOON_OF_THE_ASCENDED}>
          <>
            <ItemDamageDone amount={this.totalDamage} /><br/>
            <ItemHealingDone amount={this.atonementHealing + this.directHealing} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BoonOfTheAscended;
