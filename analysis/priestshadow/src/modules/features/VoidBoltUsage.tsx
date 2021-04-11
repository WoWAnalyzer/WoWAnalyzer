import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { BeginCastEvent, CastEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import React from 'react';

import GlobalCooldown from '../core/GlobalCooldown';

// Example log: /report/ZTdNYvhp9aqQD36A/9-Mythic+Huntsman+Altimor+-+Kill+(5:47)/Lampshadow/standard/timeline
class VoidBoltUsage extends Analyzer {
  static dependencies = {
    globalCooldown: GlobalCooldown,
    spellUsable: SpellUsable,
  };
  protected globalCooldown!: GlobalCooldown;
  protected spellUsable!: SpellUsable;

  badGlobals: number = 0;
  voidBoltOnCD: boolean = false;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.begincast.by(SELECTED_PLAYER), this.onBeginCast);
  }

  onBeginCast(event: BeginCastEvent) {
    if (
      !this.selectedCombatant.hasBuff(SPELLS.VOIDFORM_BUFF.id) ||
      !this.globalCooldown.isOnGlobalCooldown(event.ability.guid)
    ) {
      return;
    }
    this.voidBoltOnCD = this.spellUsable.isOnCooldown(SPELLS.VOID_BOLT.id); // if a cast has a cast time, then when they started casting vb might've been on cooldown
  }

  onCast(event: CastEvent) {
    if (
      !this.selectedCombatant.hasBuff(SPELLS.VOIDFORM_BUFF.id) ||
      !this.globalCooldown.isOnGlobalCooldown(event.ability.guid) ||
      event.ability.guid === SPELLS.VOID_BOLT.id ||
      this.spellUsable.isOnCooldown(SPELLS.VOID_BOLT.id) ||
      this.voidBoltOnCD === true
    ) {
      return;
    }

    if (event.meta === undefined) {
      event.meta = {
        isEnhancedCast: false,
        isInefficientCast: false,
      };
    }

    event.meta.isInefficientCast = true;
    event.meta.inefficientCastReason = 'Casted while Void Bolt is off cooldown.';

    this.badGlobals += 1;
  }

  get suggestionThresholds() {
    return {
      actual: this.badGlobals,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={SPELLS.VOID_BOLT.id} /> usage can be improved. It's the highest
          priority ability to use during <SpellLink id={SPELLS.VOIDFORM_BUFF.id} />. There should
          only be 2 global cooldowns between each <SpellLink id={SPELLS.VOID_BOLT.id} /> unless you
          have more than 135% haste in which case it becomes only 1 global cooldown between{' '}
          <SpellLink id={SPELLS.VOID_BOLT.id} />.
        </>,
      )
        .icon(SPELLS.VOID_BOLT.icon)
        .actual(
          t({
            id: 'priest.shadow.suggestions.voidBolt.efficiency',
            message: `You had ${this.badGlobals} cast(s) while Void Bolt was off cooldown during Voidform.`,
          }),
        )
        .recommended(`${recommended} is recommended.`),
    );
  }
}

export default VoidBoltUsage;
