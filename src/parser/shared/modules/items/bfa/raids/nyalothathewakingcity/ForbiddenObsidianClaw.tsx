import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { Item, DamageEvent, EnergizeEvent, HealEvent } from 'parser/core/Events';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import ItemLink from 'common/ItemLink';

import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemDamageDone from 'interface/ItemDamageDone';
import ItemHealingDone from 'interface/ItemHealingDone';
import ItemManaGained from 'interface/ItemManaGained';

class ForbiddenObsidianClaw extends Analyzer {
  item: Item | undefined;
  damageDone: number = 0;
  healingDone: number = 0;
  manaGained: number = 0;

  constructor(options: any) {
    super(options);

    this.item = this.selectedCombatant.getTrinket(ITEMS.FORBIDDEN_OBSIDIAN_CLAW.id);
    this.active = Boolean(this.item);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FORBIDDEN_OBSIDIAN_CLAW_DAMAGE), this.damage);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.FORBIDDEN_OBSIDIAN_CLAW_DRAIN), this.heal);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.FORBIDDEN_OBSIDIAN_CLAW_DRAIN), this.energize);
  }

  damage(event: DamageEvent) {
    this.damageDone += event.amount + (event.absorbed || 0);
  }

  heal(event: HealEvent) {
    this.healingDone += event.amount + (event.absorbed || 0);
  }

  energize(event: EnergizeEvent) {
    this.manaGained += event.resourceChange;
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible">
        <div className="pad">
          <label><ItemLink id={this.item?.id} details={this.item} /></label>

          <div className="value">
            <ItemDamageDone amount={this.damageDone} /><br />
            <ItemHealingDone amount={this.healingDone} /><br />
            <ItemManaGained amount={this.manaGained} />
          </div>
        </div>
      </Statistic>
    );
  }
}

export default ForbiddenObsidianClaw;
