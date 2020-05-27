import React from 'react';
import SPELLS from 'common/SPELLS';
import SPECS from 'game/SPECS';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Analyzer from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, { DamageEvent } from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';

/*
 * If Rune of Power is substantially better than the rest of the row, enable
 * ROP talent suggestion. At time of writing, it's a substantial increase over
 * incanters flow for fire and arcane in all situations.
 */
const SUGGEST_ROP = { [SPECS.FROST_MAGE.id]: false, [SPECS.ARCANE_MAGE.id]: true, [SPECS.FIRE_MAGE.id]: true };

const DAMAGE_BONUS = 0.4;
const RUNE_DURATION = 10;
const INCANTERS_FLOW_EXPECTED_BOOST = 0.12;

// FIXME due to interactions with Ignite, the damage boost number will be underrated for Fire Mages. Still fine for Arcane and Frost.
class RuneOfPower extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  hasROP = false;
  damage = 0;

  constructor(options: any) {
    super(options);

    if (this.selectedCombatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id)) {
      this.hasROP = true;
      this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onPlayerDamage);
    }
  }

  onPlayerDamage(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.RUNE_OF_POWER_BUFF.id)) {
      this.damage += calculateEffectiveDamage(event, DAMAGE_BONUS);
    }
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damage);
  }

  get damageIncreasePercent() {
    return this.damagePercent / (1 - this.damagePercent);
  }

  get uptimeMS() {
    return this.selectedCombatant.getBuffUptime(SPELLS.RUNE_OF_POWER_BUFF.id);
  }

  get roundedSecondsPerCast() {
    return ((this.uptimeMS / this.abilityTracker.getAbility(SPELLS.RUNE_OF_POWER_TALENT.id).casts) / 1000);
  }

  get damageSuggestionThresholds() {
    return {
      actual: this.damageIncreasePercent,
      isLessThan: {
        minor: INCANTERS_FLOW_EXPECTED_BOOST,
        average: INCANTERS_FLOW_EXPECTED_BOOST,
        major: INCANTERS_FLOW_EXPECTED_BOOST - 0.03,
      },
      style: 'percentage',
    };
  }

  get roundedSecondsSuggestionThresholds() {
    return {
      actual: this.roundedSecondsPerCast,
      isLessThan: {
        minor: RUNE_DURATION,
        average: RUNE_DURATION - 1,
        major: RUNE_DURATION - 2,
      },
      style: 'number',
    };
  }

  showSuggestion = true;
  suggestions(when: any) {
    if (!this.hasROP) {
      when(SUGGEST_ROP[this.selectedCombatant.specId]).isTrue()
        .addSuggestion((suggest: any) => {
          return suggest(
            <>
            It is highly recommended to talent into <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> when playing this spec.
            While it can take some practice to master, when played correctly it outputs substantially more DPS than <SpellLink id={SPELLS.INCANTERS_FLOW_TALENT.id} /> or <SpellLink id={SPELLS.MIRROR_IMAGE_TALENT.id} />.
            </>)
            .icon(SPELLS.RUNE_OF_POWER_TALENT.icon)
            .staticImportance(SUGGESTION_IMPORTANCE.REGULAR);
        });
      return;
    }

    if(!this.showSuggestion) {
      return;
    }

    when(this.damageSuggestionThresholds)
      .addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest(<>Your <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> damage boost is below the expected passive gain from <SpellLink id={SPELLS.INCANTERS_FLOW_TALENT.id} />. Either find ways to make better use of the talent, or switch to <SpellLink id={SPELLS.INCANTERS_FLOW_TALENT.id} />.</>)
          .icon(SPELLS.RUNE_OF_POWER_TALENT.icon)
          .actual(`${formatPercentage(this.damageIncreasePercent)}% damage increase from Rune of Power`)
          .recommended(`${formatPercentage(recommended)}% is the passive gain from Incanter's Flow`);
      });

    if (this.abilityTracker.getAbility(SPELLS.RUNE_OF_POWER_TALENT.id).casts > 0) {
      when(this.roundedSecondsSuggestionThresholds)
        .addSuggestion((suggest: any, actual: any, recommended: any) => {
          return suggest(<>You sometimes aren't standing in your <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> for its full duration. Try to only use it when you know you won't have to move for the duration of the effect.</>)
            .icon(SPELLS.RUNE_OF_POWER_TALENT.icon)
            .actual(`Average ${this.roundedSecondsPerCast.toFixed(1)}s standing in each Rune of Power`)
            .recommended(`the full duration of ${formatNumber(RUNE_DURATION)}s is recommended`);
        });
    }

  }

  statistic() {
    if (this.hasROP) {
      return (
        <Statistic
          size="flexible"
          category={STATISTIC_CATEGORY.TALENTS}
          tooltip={<>This is the portion of your total damage attributable to Rune of Power's boost. Expressed as an increase vs never using Rune of Power, this is a <strong>{formatPercentage(this.damageIncreasePercent)}% damage increase</strong>. Note that this number does <em>not</em> factor in the opportunity cost of casting Rune of Power instead of another damaging spell.</>}
        >
          <BoringSpellValueText spell={SPELLS.RUNE_OF_POWER_TALENT}>
            <>
              {formatPercentage(this.damagePercent,0)}% <small>Damage added by Rune of Power</small><br />
              {formatNumber(this.roundedSecondsPerCast)}s <small>Average time in Rune per cast</small>
            </>
          </BoringSpellValueText>
        </Statistic>
      );
    } else {
      return null;
    }
  }
}

export default RuneOfPower;
