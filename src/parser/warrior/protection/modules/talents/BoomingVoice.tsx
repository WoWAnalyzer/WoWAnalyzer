import React from 'react';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SPELLS from 'common/SPELLS';

import Enemies from 'parser/shared/modules/Enemies';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { formatNumber } from 'common/format';
import Events, { CastEvent, DamageEvent, EnergizeEvent } from 'parser/core/Events';

import Statistic from 'interface/statistics/Statistic';
import BoringValueText from 'interface/statistics/components/BoringValueText'
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import SpellLink from 'common/SpellLink';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

const BOOMING_VOICE_DAMAGE_INCREASE = 0.2;
const BOOMING_VOICE_RAGE_GENERATION = 40;

class BoomingVoice extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  rageGenerated = 0;
  rageWasted = 0;
  bonusDmg = 0;
  maxRage = 100;
  nextCastWasted = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BOOMING_VOICE_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEMORALIZING_SHOUT), this.onShoutCast);
    this.addEventListener(Events.energize.to(SELECTED_PLAYER).spell(SPELLS.DEMORALIZING_SHOUT), this.onShoutEnergize);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onShoutCast(event: CastEvent) {
    if (this.nextCastWasted === 0) {
      return;
    }

    event.meta = event.meta || {};
    event.meta.isInefficientCast = true;
    event.meta.inefficientCastReason = `This cast wasted ${this.nextCastWasted} Rage.`;
    this.nextCastWasted = 0;
  }

  onShoutEnergize(event: EnergizeEvent) {
    this.rageGenerated += event.resourceChange;
    const waste = event.waste || 0;
    this.rageWasted += waste;
    // on_energize event happens before the cast-event
    this.nextCastWasted = waste;
  }

  onDamage(event: DamageEvent) {
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
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.uptimeSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => suggest(<>You wasted Rage by casting <SpellLink id={SPELLS.DEMORALIZING_SHOUT.id} /> with more than {this.maxRage - BOOMING_VOICE_RAGE_GENERATION} Rage.</>)
            .icon(SPELLS.BOOMING_VOICE_TALENT.icon)
            .actual(i18n._(t('warrior.protection.suggestions.boominVoice.rage.wasted')`${actual} Rage wasted`))
            .recommended(`<${recommended} wasted Rage is recommended`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
            {formatNumber(this.bonusDmg)} damage contributed<br />
            {this.rageWasted} Rage wasted
          </>
        )}
      >
      <BoringValueText label={<><SpellLink id={SPELLS.BOOMING_VOICE_TALENT.id} /> Rage generated</>}>
          <>
            {this.rageGenerated} <small>rage</small>
          </>
        </BoringValueText>
      </Statistic>
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default BoomingVoice;
