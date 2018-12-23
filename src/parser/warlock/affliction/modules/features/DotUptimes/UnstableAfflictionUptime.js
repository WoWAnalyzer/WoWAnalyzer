import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import Events from 'parser/core/Events';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import { formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

import { UNSTABLE_AFFLICTION_DEBUFFS } from '../../../constants';

const CONTAGION_DAMAGE_BONUS = 0.1; // former talent Contagion is now baked into UA
class UnstableAfflictionUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  buffedTime = 0;
  damage = 0;
  _buffStart = 0;
  _count = 0;

  constructor(...args) {
    super(...args);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(UNSTABLE_AFFLICTION_DEBUFFS), this.onUAapply);
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(UNSTABLE_AFFLICTION_DEBUFFS), this.onUAremove);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onUAapply(event) {
    if (this._count === 0) {
      this._buffStart = event.timestamp;
    }
    this._count += 1;
  }

  onUAremove(event) {
    this._count -= 1;
    if (this._count === 0) {
      this.buffedTime += event.timestamp - this._buffStart;
    }
  }

  onDamage(event) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    if (UNSTABLE_AFFLICTION_DEBUFFS.every(spell => !enemy.hasBuff(spell.id))) {
      return;
    }
    this.damage += calculateEffectiveDamage(event, CONTAGION_DAMAGE_BONUS);
  }

  get uptime() {
    return this.buffedTime / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    // raises the thresholds by 5% if player has Cascading Calamity trait
    const cascadingCalamityBonus = this.selectedCombatant.hasTrait(SPELLS.CASCADING_CALAMITY.id) ? 0.05 : 0;
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.7 + cascadingCalamityBonus,
        average: 0.6 + cascadingCalamityBonus,
        major: 0.5 + cascadingCalamityBonus,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <>
            Your <SpellLink id={SPELLS.UNSTABLE_AFFLICTION_CAST.id} /> uptime is too low. Try spacing out your UAs a little more so that you get the most out of the internal 10% damage bonus, unless you're pooling for <SpellLink id={SPELLS.SUMMON_DARKGLARE.id} /> or focusing priority targets.
          </>
        )
          .icon(SPELLS.UNSTABLE_AFFLICTION_CAST.icon)
          .actual(`${formatPercentage(actual)}% Unstable Affliction uptime.`)
          .recommended(`> ${formatPercentage(recommended)}% is recommended`);
      });
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.UNSTABLE_AFFLICTION_CAST.id} /> uptime</>}
        value={`${formatPercentage(this.uptime)} %`}
        valueTooltip={`Bonus damage from internal Contagion effect: ${formatThousands(this.damage)} (${this.owner.formatItemDamageDone(this.damage)})`}
      />
    );
  }
}

export default UnstableAfflictionUptime;
