import React from 'react';
import { Trans } from '@lingui/macro';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import BoringSpellValue from 'interface/statistics/components/BoringSpellValue';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import Events, { CastEvent } from 'parser/core/Events';

const BUFF_TOTEM_RESONANCE_SPELL_ID = 262419;
const BUFF_TOTEM_EMBER_SPELL_ID = 262398;
const BUFF_TOTEM_TAILWIND_SPELL_ID = 262401;

/**
 * Summon four totems that increase your combat capabilities for 120 seconds.
 * Resonance Totem: Generates 1 Maelstrom every 1s.
 * Storm Totem: Increases the damage of Stormstrike by 10%.
 * Ember Totem: Increases Lava Lash damage by 10%.
 * Tailwind Totem: Increases chance to trigger Windfury by 2%.
 */
class TotemMastery extends Analyzer {
  protected casts: number = 0;

  constructor(options: any) {
    super(options);

    if(!this.selectedCombatant.hasTalent(SPELLS.TOTEM_MASTERY_TALENT_ENHANCEMENT.id)) {
      this.active = false;
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(
        SPELLS.TOTEM_MASTERY_TALENT_ENHANCEMENT,
      ),
      this.onCast,
    );
  }

  protected onCast(event: CastEvent) {
    this.casts += 1;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.minUptime,
      isLessThan: {
        minor: 0.99,
        average: 0.94,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  get minUptime() {
    return Math.min(
      this.selectedCombatant.getBuffUptime(BUFF_TOTEM_RESONANCE_SPELL_ID),
      this.selectedCombatant.getBuffUptime(BUFF_TOTEM_EMBER_SPELL_ID),
      this.selectedCombatant.getBuffUptime(BUFF_TOTEM_TAILWIND_SPELL_ID),
    ) / this.owner.fightDuration;
  }

  suggestions(when: any) {
    when(this.uptimeSuggestionThresholds).addSuggestion(
      (suggest: any, actual: any, recommended: any) => {
        return suggest(
          <Trans>
            Your <SpellLink id={SPELLS.TOTEM_MASTERY_TALENT_ENHANCEMENT.id} /> uptime can be improved. Try to place the totems better.
          </Trans>,
        )
          .icon(SPELLS.TOTEM_MASTERY_TALENT_ENHANCEMENT.icon)
          .actual(
            <Trans>
              {formatPercentage(actual)}% uptime
            </Trans>,
          )
          .recommended(
            <Trans>&gt;{formatPercentage(recommended)}% is recommended</Trans>,
          );
      });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValue
          spell={SPELLS.TOTEM_MASTERY_TALENT_ENHANCEMENT}
          value={<Trans>formatPercentage(this.minUptime)%</Trans>}
          label={<Trans>Uptime</Trans>}
        />
      </Statistic>
    );
  }
}

export default TotemMastery;
