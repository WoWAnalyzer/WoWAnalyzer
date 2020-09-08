import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { formatNumber } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';

const debug = false;

const TRAIT_STACK_THRESHOLD = 3;

class BlasterMaster extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  lastCombustion = null;
  stackCount = 0;
  totalStacks = 0;
  badCombustion = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTrait(SPELLS.BLASTER_MASTER.id);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.COMBUSTION), this.onCombustionStart);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.COMBUSTION), this.onCombustionEnd);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.BLASTER_MASTER_BUFF), this.onTraitStack);
    this.addEventListener(Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS.BLASTER_MASTER_BUFF), this.onTraitStack);
  }

  onCombustionStart() {
    const buff: any = this.selectedCombatant.getBuff(SPELLS.BLASTER_MASTER_BUFF.id);
    if (buff) {
      this.stackCount = buff.stacks;
    }
  }

  onCombustionEnd() {
    if (this.stackCount < TRAIT_STACK_THRESHOLD) {
      this.badCombustion += 1;
    }
    this.totalStacks += this.stackCount;
    debug && this.log("Combustion Ended: " + this.stackCount + " stacks");
  }

  onTraitStack() {
    const buff = this.selectedCombatant.getBuff(SPELLS.BLASTER_MASTER_BUFF.id);
    if (buff && buff.stacks > this.stackCount) {
      this.stackCount = buff.stacks;
      debug && this.log("Gained Blaster Master Stack. " + this.stackCount + " Stacks Total");
    }
  }

  get averageStacksPerCombustion() {
    return this.totalStacks / this.abilityTracker.getAbility(SPELLS.COMBUSTION.id).casts;
  }

  get averageStackThresholds() {
    return {
      actual: this.averageStacksPerCombustion,
      isLessThan: {
        minor: 3,
        average: 2.5,
        major: 2,
      },
      style: 'number',
    };
  }

  suggestions(when: any) {
    when(this.averageStackThresholds)
      .addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest(<>On average, you got {this.averageStacksPerCombustion.toFixed(2)} stacks of <SpellLink id={SPELLS.BLASTER_MASTER.id} /> per <SpellLink id={SPELLS.COMBUSTION.id} /> cast. In order to maximize the use of the trait, you should aim for getting to {TRAIT_STACK_THRESHOLD} stacks each time you use Combustion. For more information on how to adjust your Combustion rotation to make this happen, refer to <a href="https://cdn.discordapp.com/attachments/524387813060247553/606533890080899083/bm_combustion.png" target="_blank" rel="noopener noreferrer">this graphic</a></>)
          .icon(SPELLS.BLASTER_MASTER.icon)
          .actual(`${this.averageStacksPerCombustion.toFixed(2)} stacks per Combustion`)
          .recommended(`${formatNumber(recommended)} is recommended`);
      });
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.AZERITE_POWERS}
        tooltip={`Blaster Master is a somewhat complicated trait to get the full effect from and may involve adjusting your rotation during Combustion. In order to get the most out of this trait, you should aim to get to ${TRAIT_STACK_THRESHOLD} stacks of the Blaster Master during Combustion. For additional information on how to accomplish this, refer to the Mage Discord or the link in the Suggestion.`}
      >
        <BoringSpellValueText spell={SPELLS.BLASTER_MASTER}>
          <>
            {this.averageStacksPerCombustion.toFixed(2)} <small>Stacks per Combustion</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BlasterMaster;
