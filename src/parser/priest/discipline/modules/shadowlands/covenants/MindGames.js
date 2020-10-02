import React from 'react';

import ItemHealingDone from 'interface/ItemHealingDone';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import { TooltipElement } from 'common/Tooltip';
import COVENANTS from 'game/shadowlands/COVENANTS';

import Analyzer from 'parser/core/Analyzer';

import AtonementDamageSource from '../../features/AtonementDamageSource';
import isAtonement from '../../core/isAtonement';

class MindGames extends Analyzer {
  static dependencies = {
    atonementDamageSource: AtonementDamageSource,
  };

  atonementHealing = 0;
  directHealing = 0;
  preventedDamage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.VENTHYR.id);
  }

  on_byPlayer_heal(event) {

    if (isAtonement(event)) {

      const atonenementDamageEvent = this.atonementDamageSource.event;
      if (atonenementDamageEvent.ability.guid !== SPELLS.MIND_GAMES.id) {
        return;
      }

      this.atonementHealing += event.amount + (event.absorbed || 0);
      return;
    }

    const spellId = event.ability.guid;
    if (spellId === SPELLS.MIND_GAMES_HEAL.id) {
      this.directHealing += event.amount + (event.absorbed || 0);
      return;
    }
  }

  on_byPlayer_absorbed(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MIND_GAMES_ABSORB.id) {
      return;
    }
    this.preventedDamage += event.amount;
  }

  statistic() {
    return (
      <>
        <StatisticBox
          position={STATISTIC_ORDER.OPTIONAL(50)}
          icon={<SpellIcon id={SPELLS.MIND_GAMES.id} />}
          value={<ItemHealingDone amount={this.atonementHealing + this.directHealing + this.preventedDamage} />}
          label={
            <TooltipElement
              content={
                <>
                  Healing Breakdown:
                      <ul>
                    <li>{formatNumber(this.atonementHealing)} Atonement healing</li>
                    <li>{formatNumber(this.directHealing)} Direct Healing</li>
                    <li>{formatNumber(this.preventedDamage)} Prevented Damage</li>
                  </ul>
                </>
              }
            >
              Total Healing Contributed
                </TooltipElement>
          }
        />
      </>
    );
  }
}

export default MindGames;