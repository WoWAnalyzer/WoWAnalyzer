import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Enemies from 'parser/core/modules/Enemies';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { formatNumber } from 'common/format';

const BOOMING_VOICE_DAMAGE_INCREASE = 0.15;
const BOOMING_VOICE_RAGE_GENERATION = 40;

class BoomingVoice extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  rageGenerated = 0;
  rageWasted = 0;
  bonusDmg = 0;
  maxRage = 100;
  nextCastWasted = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BOOMING_VOICE_TALENT.id);
    this.maxRage += this.selectedCombatant.traitsBySpellId[SPELLS.INTOLERANCE_TRAIT.id] * 10;
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.DEMORALIZING_SHOUT.id || this.nextCastWasted === 0) {
      return;
    }

    event.meta = event.meta || {};
    event.meta.isInefficientCast = true;
    event.meta.inefficientCastReason = `This cast wasted ${this.nextCastWasted} Rage.`;
    this.nextCastWasted = 0;
  }

  on_energize(event) {
    if (event.ability.guid !== SPELLS.DEMORALIZING_SHOUT.id) {
      return;
    }

    this.rageGenerated += event.resourceChange;
    const waste = event.waste || 0;
    this.rageWasted += waste;
    //on_energize event happens before the cast-event
    this.nextCastWasted = waste;
  }

  on_byPlayer_damage(event) {
    if (event.targetIsFriendly) {
      return;
    }
    const enemy = this.enemies.getEntity(event);
    if (enemy && enemy.hasBuff(SPELLS.DEMORALIZING_SHOUT.id)) {
      this.bonusDmg += calculateEffectiveDamage(event, BOOMING_VOICE_DAMAGE_INCREASE);
    }
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.rageWasted,
      isGreaterThan: {
        minor: 0,
        average: 10,
        major: 20,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.uptimeSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<>You wasted Rage by casting <SpellLink id={SPELLS.DEMORALIZING_SHOUT.id} /> with more than {this.maxRage - BOOMING_VOICE_RAGE_GENERATION} Rage.</>)
            .icon(SPELLS.BOOMING_VOICE_TALENT.icon)
            .actual(`${actual} Rage wasted`)
            .recommended(`<${recommended} wasted Rage is recommended`);
        });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BOOMING_VOICE_TALENT.id} />}
        value={`${this.rageGenerated}`}
        label="Rage generated"
        tooltip={`${formatNumber(this.bonusDmg)} damage contributed<br/>${this.rageWasted} Rage wasted
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default BoomingVoice;
