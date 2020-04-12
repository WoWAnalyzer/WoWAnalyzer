import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/shaman';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatNumber } from 'common/format';
import React from 'react';
import StatisticBox from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';

const STORMBRINGER_DAMAGE_MODIFIER = 0.25;

class Stormbringer extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  damageGained = 0;
  procCount = 0;
  procUses = 0;

  resetCooldowns() {
    if(this.spellUsable.isOnCooldown(SPELLS.STORMSTRIKE_CAST.id)){
      this.spellUsable.endCooldown(SPELLS.STORMSTRIKE_CAST.id);
    }

    if(this.spellUsable.isOnCooldown(SPELLS.WINDSTRIKE_CAST.id)){
      this.spellUsable.endCooldown(SPELLS.WINDSTRIKE_CAST.id);
    }
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid!==SPELLS.STORMSTRIKE_CAST.id && event.ability.guid !== SPELLS.WINDSTRIKE_CAST.id) {
      return;
    }

    if(!this.selectedCombatant.hasBuff(SPELLS.STORMBRINGER_BUFF.id)){
      return;
    }

    this.procUses++;
    this.resetCooldowns();
  }

  on_byPlayer_refreshbuff(event) {
    if(event.ability.guid !== SPELLS.STORMBRINGER_BUFF.id) {
      return;
    }

    this.procCount++;

    this.resetCooldowns();
  }

  on_byPlayer_applybuff(event) {
    if(event.ability.guid !== SPELLS.STORMBRINGER_BUFF.id) {
      return;
    }

    this.procCount++;

    this.resetCooldowns();
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.STORMSTRIKE_ATTACK.id &&
      event.ability.guid !== SPELLS.STORMSTRIKE_ATTACK_OFFHAND.id &&
      event.ability.guid !== SPELLS.WINDSTRIKE_ATTACK.id &&
      event.ability.guid !== SPELLS.WINDSTRIKE_ATTACK_OFFHAND.id) {
      return;
    }

    if(!this.selectedCombatant.hasBuff(SPELLS.STORMBRINGER_BUFF.id)) {
      return;
    }

    this.damageGained += calculateEffectiveDamage(event, STORMBRINGER_DAMAGE_MODIFIER);
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damageGained);
  }

  get damagePerSecond() {
    return this.damageGained / this.owner.fightDuration * 1000;
  }

  get suggestionThresholds() {
    return {
      actual: this.procUses / this.procCount,
      isLessThan: {
        minor: 0.85,
        average: 0.70,
        major: 0.6,
      },
      style: 'decimal',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Cast <SpellLink id={SPELLS.STORMSTRIKE_CAST.id} /> or <SpellLink id={SPELLS.WINDSTRIKE_CAST.id} /> more often when <SpellLink id={SPELLS.STORMBRINGER.id} /> by using it before combat.</span>)
          .icon(SPELLS.STORMBRINGER.icon)
          .actual(`${formatPercentage(actual)}% procs used`)
          .recommended(`${(formatPercentage(recommended, 0))}% is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.STORMBRINGER_BUFF.id} />}
        value={<>
          {formatPercentage(this.damagePercent)} % / {formatNumber(this.damagePerSecond)} DPS
        </>}
        label="Stormbringer Contribution"
        tooltip={<>
          Strombringer is a passive ability of the Enhancment Shaman. The chance for this to proc is increased by your Mastery. Stormbringer has contributed: <br />
          <ul>
            <li><b>{formatNumber(this.damageGained)}</b> total damage</li>
            <li><b>{formatNumber(this.damagePerSecond )}</b> DPS</li>
            <li><b>{formatPercentage(this.damagePercent)} %</b> of your total damage</li>
          </ul>
          <br />
          You've used <b>{this.procUses}</b> out of <strong>{this.procCount}</strong> Stormbringer procs.
        </>}
      />
    );
  }
}

export default Stormbringer;
