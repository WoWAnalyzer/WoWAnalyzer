import React from 'react';

import ItemHealingDone from 'interface/ItemHealingDone';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import COVENANTS from 'game/shadowlands/COVENANTS';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

import AtonementDamageSource from 'parser/priest/discipline/modules/features/AtonementDamageSource';
import isAtonement from 'parser/priest/discipline/modules/core/isAtonement';
import SPECS from 'game/SPECS';
import ItemDamageDone from 'interface/ItemDamageDone';

// Shadow: https://www.warcraftlogs.com/reports/CdrMAqzkLaKZTVn4#fight=1&type=damage-done&graphperf=1&source=19
// Holy: https://www.warcraftlogs.com/reports/xf7zjvNghdXVRrFT#fight=7&type=healing&graphperf=1&source=18
// Disc: https://www.warcraftlogs.com/reports/FwfkDG87xzV9CWra#fight=17&type=healing&source=14
class BoonOfTheAscended extends Analyzer {
  totalDamage = 0;
  directHealing = 0;

  // Disc Specific
  atonementDamageSource: AtonementDamageSource | null = null;
  atonementHealing = 0;

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
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell([SPELLS.ASCENDED_BLAST, SPELLS.ASCENDED_NOVA, SPELLS.ASCENDED_ERUPTION]), this.onHeal);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell([SPELLS.ASCENDED_BLAST_HEAL, SPELLS.ASCENDED_NOVA_HEAL, SPELLS.ASCENDED_ERUPTION_HEAL]), this.onHeal);
  }

  onDamage(event: DamageEvent) {
    this.totalDamage += event.amount + (event.absorb || 0);
  }

  onHeal(event: HealEvent) {
    if (isAtonement(event) && this.atonementDamageSource) {
      console.log("Is Atonement", event);
      const atonenementDamageEvent = this.atonementDamageSource.event;

      if (!atonenementDamageEvent) {
        return;
      }
      this.atonementHealing += event.amount + (event.absorbed || 0);
    } else {
      this.directHealing += event.amount + (event.absorbed || 0);
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        tooltip={(
          <>
            Healing Breakdown:
            <ul>
              <li>{formatNumber(this.atonementHealing)} Atonement Healing</li>
              <li>{formatNumber(this.directHealing)} Direct Healing</li>
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
