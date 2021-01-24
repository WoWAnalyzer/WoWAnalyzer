import React from 'react';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Enemies from 'parser/shared/modules/Enemies';
import UptimeIcon from 'interface/icons/Uptime';
import { formatNumber, formatPercentage } from 'common/format';
import CritIcon from 'interface/icons/CriticalStrike';
import COVENANTS from 'game/shadowlands/COVENANTS';

import { RESONATING_ARROW_CRIT_INCREASE } from '../../constants';

class ResonatingArrow extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    enemies: Enemies,
  };

  casts: number = 0;
  debuffs: number = 0;
  damage = 0;

  protected abilities!: Abilities;
  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasCovenant(COVENANTS.KYRIAN.id);

    if (!this.active) {
      return;
    }

    (options.abilities as Abilities).add({
      spell: SPELLS.RESONATING_ARROW,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      cooldown: 60,
      gcd: {
        base: 1500,
      },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.9,
      },
    });

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RESONATING_ARROW), this.onCast);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.RESONATING_ARROW_DEBUFF), this.onDebuff);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RESONATING_ARROW_DAMAGE), this.onDamage);
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.RESONATING_ARROW_DEBUFF.id) / this.owner.fightDuration;
  }

  onCast() {
    this.casts += 1;
  }

  onDebuff() {
    this.debuffs += 1;
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={(
          <>
            You had {this.casts} {this.casts === 1 ? 'cast' : 'casts'} of Resonating Arrow and applied the debuff {this.debuffs} {this.debuffs === 1 ? 'time' : 'times'}.
            <br />
            The direct damage of Resonating Arrow did {this.damage} damage or {formatNumber((this.damage / this.owner.fightDuration) * 1000)} DPS
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.RESONATING_ARROW}>
          <>
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small> debuff uptime</small>
            <br />
            <CritIcon /> {formatPercentage(this.uptime * RESONATING_ARROW_CRIT_INCREASE)}% <small>average Critical Strike</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default ResonatingArrow;
