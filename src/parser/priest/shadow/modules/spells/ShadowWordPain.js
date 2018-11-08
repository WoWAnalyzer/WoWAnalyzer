import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import SmallStatisticBox, { STATISTIC_ORDER } from 'interface/others/SmallStatisticBox';
import AbilityTracker from 'parser/priest/shadow/modules/core/AbilityTracker';

const MS_BUFFER = 100;

/*
  Shadow word pain can be created by:

  Hard casting
  Misery
  Dark Void

  Shadow Word pain can be refreshed by:

  Hard casting
  Misery
  Dark Void
  Void Bolt
 */
class ShadowWordPain extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    abilityTracker: AbilityTracker,
  };

  castedShadowWordPains = 0;
  appliedShadowWordPains = 0;
  refreshedShadowWordPains = 0;

  // Dark Void
  lastDarkVoidCastTimestamp = 0;
  darkVoidShadowWordPainApplications = 0;
  darkVoidShadowWordPainRefreshes = 0;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.SHADOW_WORD_PAIN.id) / this.owner.fightDuration;
  }

  get damage() {
    const spell = this.abilityTracker.getAbility(SPELLS.SHADOW_WORD_PAIN.id);
    return spell.damageEffective + spell.damageAbsorbed;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.SHADOW_WORD_PAIN.id) {
      this.castedShadowWordPains += 1;
    }
    if (spellId === SPELLS.DARK_VOID_TALENT.id) {
      this.lastCastTimestamp = event.timestamp;
    }
  }

  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SHADOW_WORD_PAIN.id) {
      return;
    }

    this.appliedShadowWordPains += 1;

    if (this.lastCastTimestamp !== 0 && event.timestamp < this.lastCastTimestamp + MS_BUFFER) {
      this.darkVoidShadowWordPainApplications += 1;
    }
  }

  on_byPlayer_refreshdebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SHADOW_WORD_PAIN.id) {
      return;
    }

    this.refreshedShadowWordPains += 1;

    if (this.lastCastTimestamp !== 0 && event.timestamp < this.lastCastTimestamp + MS_BUFFER) {
      this.darkVoidShadowWordPainRefreshes += 1;
    }
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    const {
      isLessThan: {
        minor,
        average,
        major,
      },
    } = this.suggestionThresholds;

    when(this.uptime).isLessThan(minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> uptime can be improved. Try to pay more attention to your <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> on the boss.</span>)
          .icon(SPELLS.SHADOW_WORD_PAIN.icon)
          .actual(`${formatPercentage(actual)}% Shadow Word: Pain uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(average).major(major);
      });
  }

  statistic() {
    return (
      <SmallStatisticBox
        position={STATISTIC_ORDER.CORE(4)}
        icon={<SpellIcon id={SPELLS.SHADOW_WORD_PAIN.id} />}
        value={`${formatPercentage(this.uptime)} %`}
        label="Shadow Word: Pain uptime"
      />
    );
  }
}

export default ShadowWordPain;
