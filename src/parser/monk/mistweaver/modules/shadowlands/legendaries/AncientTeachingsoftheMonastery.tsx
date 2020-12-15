import React from 'react';

import SPELLS from 'common/SPELLS';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import SpellLink from 'common/SpellLink';

import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { formatThousands } from 'common/format';
import DonutChart from 'interface/statistics/components/DonutChart';

class AncientTeachingsoftheMonastery extends Analyzer {

  damageSpellToHealing: Map<number, number> = new Map();

  lastDamageSpellID: number = 0;

  /**
   * After you cast Essence Font, Tiger Palm, Blackout Kick, and Rising Sun Kick heal an injured ally within 20 yards for 250% of the damage done. Lasts 15s.
   */
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.ANCIENT_TEACHINGS_OF_THE_MONASTERY.bonusID);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.RISING_SUN_KICK_SECOND, SPELLS.BLACKOUT_KICK, SPELLS.BLACKOUT_KICK_TOTM, SPELLS.TIGER_PALM]), this.lastDamageEvent);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ANCIENT_TEACHINGS_OF_THE_MONASTERY_HEAL), this.calculateEffectiveHealing);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ANCIENT_TEACHINGS_OF_THE_MONASTERY_CRIT_HEAL), this.calculateEffectiveHealing);
  }

  lastDamageEvent(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.ANCIENT_TEACHINGS_OF_THE_MONASTERY_BUFF.id)) {
      return;
    }
    this.lastDamageSpellID = event.ability.guid;
    if (!this.damageSpellToHealing.has(this.lastDamageSpellID)) {
      this.damageSpellToHealing.set(this.lastDamageSpellID, 0);
    }
  }

  calculateEffectiveHealing(event: HealEvent) {
    const heal = (event.amount || 0) + (event.absorbed || 0);
    const oldHealingTotal = this.damageSpellToHealing.get(this.lastDamageSpellID) || 0;
    this.damageSpellToHealing.set(this.lastDamageSpellID, heal + oldHealingTotal);
  }

  renderDonutChart() {
    const rskHealing = (this.damageSpellToHealing.get(SPELLS.RISING_SUN_KICK_SECOND.id) || 0);
    const bokHealing = (this.damageSpellToHealing.get(SPELLS.BLACKOUT_KICK.id) || 0);
    const totmHealing = (this.damageSpellToHealing.get(SPELLS.BLACKOUT_KICK_TOTM.id) || 0);
    const tpHealing = (this.damageSpellToHealing.get(SPELLS.TIGER_PALM.id) || 0);
    const totalHealing = rskHealing + bokHealing + totmHealing + tpHealing;

    const items = [
      {
        color: '#ffc425',
        label: 'Rising Sun Kick',
        spellId: SPELLS.RISING_SUN_KICK.id,
        value: rskHealing / totalHealing,
        valueTooltip: formatThousands(rskHealing),
      },
      {
        color: '#7500db',
        label: 'Blackout Kick',
        spellId: SPELLS.BLACKOUT_KICK.id,
        value: bokHealing / totalHealing,
        valueTooltip: formatThousands(bokHealing),
      },
      {
        color: '#db00db',
        label: 'Teachings of the Monastery',
        spellId: SPELLS.BLACKOUT_KICK_TOTM.id,
        value: totmHealing / totalHealing,
        valueTooltip: formatThousands(totmHealing),
      },
      {
        color: '#00b159',
        label: 'Tiger Palm',
        spellId: SPELLS.TIGER_PALM.id,
        value: tpHealing / totalHealing,
        valueTooltip: formatThousands(tpHealing),
      },
    ];

    return (
      <DonutChart
        items={items}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <div className="pad">
          <label><SpellLink id={SPELLS.ANCIENT_TEACHINGS_OF_THE_MONASTERY_HEAL.id}>Ancient Teachings of the Monastery</SpellLink> breakdown</label>
          {this.renderDonutChart()}
        </div>
      </Statistic>
    );
  }
}

export default AncientTeachingsoftheMonastery;
