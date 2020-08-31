import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import { CastEvent, ApplyDebuffEvent, RefreshDebuffEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
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
  protected enemies!: Enemies;
  protected abilityTracker!: AbilityTracker;

  lastCastTimestamp = 0;
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

  on_byPlayer_cast(event: CastEvent) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.SHADOW_WORD_PAIN.id) {
      this.castedShadowWordPains += 1;
    }
  }

  on_byPlayer_applydebuff(event: ApplyDebuffEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SHADOW_WORD_PAIN.id) {
      return;
    }

    this.appliedShadowWordPains += 1;

    if (this.lastCastTimestamp !== 0 && event.timestamp < this.lastCastTimestamp + MS_BUFFER) {
      this.darkVoidShadowWordPainApplications += 1;
    }
  }

  on_byPlayer_refreshdebuff(event: RefreshDebuffEvent) {
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

  suggestions(when: any) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest(<span>Your <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> uptime can be improved. Try to pay more attention to your <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> on the boss.</span>)
          .icon(SPELLS.SHADOW_WORD_PAIN.icon)
          .actual(`${formatPercentage(actual)}% Shadow Word: Pain uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(4)}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.SHADOW_WORD_PAIN}>
          <>
          {formatPercentage(this.uptime)}% <small>Uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ShadowWordPain;
