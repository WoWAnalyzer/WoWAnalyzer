import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage, formatThousands } from 'common/format';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, HealEvent } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Statistic from 'interface/statistics/Statistic';
import BoringValueText from 'interface/statistics/components/BoringValueText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import { t } from '@lingui/macro';

class ManaTea extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  manaSavedMT: number = 0;
  manateaCount: number = 0;
  casts: Map<string, number> = new Map<string, number>();
  effectiveHealing: number = 0;
  overhealing: number = 0;
  protected abilityTracker!: AbilityTracker;

 constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MANA_TEA_TALENT.id);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.handleCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.heal);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MANA_TEA_TALENT), this.applyBuff);
  } 

  applyBuff(event: ApplyBuffEvent) {
    this.manateaCount += 1;//count the number of mana teas to make an average over teas
  }

  heal(event: HealEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.MANA_TEA_TALENT.id)) {//if this is in a mana tea window
      this.effectiveHealing += (event.amount || 0) + (event.absorbed || 0);
      this.overhealing += (event.overheal || 0);
    }
  }

  handleCast(event: CastEvent) {
    const name = event.ability.name;
    const manaEvent = event.classResources?.find(resource => resource.type === RESOURCE_TYPES.MANA.id);
    if (manaEvent === undefined) {
      return;
    }

    if (this.selectedCombatant.hasBuff(SPELLS.MANA_TEA_TALENT.id) && event.ability.guid !== SPELLS.MANA_TEA_TALENT.id) {//we check both since melee doesn't havea classResource
      if (manaEvent.cost !== undefined) { //checks if the spell costs anything (we don't just use cost since some spells don't play nice)
        this.manaSavedMT += manaEvent.cost / 2;
      }
      if (this.casts.has(name)) {
        this.casts.set(name, (this.casts.get(name) || 0) + 1);
      } else {
        this.casts.set(name, 1);
      }
    }
  }

  get avgMtSaves() {
    return this.manaSavedMT / this.manateaCount || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.avgMtSaves,
      isLessThan: {
        minor: 7500,
        average: 6500,
        major: 5500,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get avgOverhealing() {
    return parseFloat((this.overhealing / (this.overhealing + this.effectiveHealing) || 0).toFixed(4));
  }

  get suggestionThresholdsOverhealing() {
    return {
      actual: this.avgOverhealing,
      isGreaterThan: {
        minor: .20,
        average: .30,
        major: .40,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(
      <>
        Your mana spent during <SpellLink id={SPELLS.MANA_TEA_TALENT.id} /> can be improved. Aim to prioritize as many <SpellLink id={SPELLS.VIVIFY.id} /> casts until the last second of the buff and then cast <SpellLink id={SPELLS.ESSENCE_FONT.id} />. <SpellLink id={SPELLS.ESSENCE_FONT.id} />'s mana cost is taken at the beginning of the channel, so you gain the benefit of <SpellLink id={SPELLS.MANA_TEA_TALENT.id} /> even if the channel continues past the buff.
      </>,
    )
      .icon(SPELLS.MANA_TEA_TALENT.icon)
      .actual(`${formatNumber(this.avgMtSaves)}${t({
      id: "monk.mistweaver.suggestions.manaTea.avgManaSaved",
      message: ` average mana saved per Mana Tea cast`
    })}`)
      .recommended(`${(recommended / 1000).toFixed(0)}k average mana saved is recommended`));
    when(this.suggestionThresholdsOverhealing).addSuggestion((suggest, actual, recommended) => suggest(
      <>
        Your average overhealing was high during your <SpellLink id={SPELLS.MANA_TEA_TALENT.id} /> usage. Consider using <SpellLink id={SPELLS.MANA_TEA_TALENT.id} /> during specific boss abilities or general periods of high damage to the raid. Also look to target low health raid members to avoid large amounts of overhealing.
      </>,
    )
      .icon(SPELLS.MANA_TEA_TALENT.icon)
      .actual(`${formatPercentage(this.avgOverhealing)}${t({
      id: "monk.mistweaver.suggestions.manaTea.avgOverHealing",
      message: ` % average overhealing per Mana Tea cast`
    })}`)
      .recommended(`under ${formatPercentage(recommended)}% over healing is recommended`));
  }

  statistic() {
    const arrayOfKeys = Array.from(this.casts.keys());
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(25)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
            During your {this.manateaCount} Mana Teas saved the following mana ({formatThousands(this.manaSavedMT / this.owner.fightDuration * 1000 * 5)} MP5):
            <ul>
              {
                arrayOfKeys.map(spell => (
                  <li key={spell}>
                    {this.casts.get(spell)} {spell} casts
                  </li>
                ))
              }
            </ul>
          </>
        )}
      >
        <BoringValueText
          label={<><SpellIcon id={SPELLS.MANA_TEA_TALENT.id} /> Average mana saved</>}
        >
          <>
            {formatNumber(this.avgMtSaves)}
          </>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default ManaTea;