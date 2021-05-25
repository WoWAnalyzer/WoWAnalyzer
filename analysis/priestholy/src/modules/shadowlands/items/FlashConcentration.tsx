import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ApplyBuffStackEvent, ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';

class FlashConcentration extends Analyzer {
  totalDrops = 0;
  suggestion = {
    actual: true,
    isEqual: true,
    style: ThresholdStyle.BOOLEAN,
  };

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.FLASH_CONCENTRATION),
      this.onByPlayerFlashConcentrationBuff,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FLASH_CONCENTRATION),
      this.onByPlayerFlashConcentrationInitialBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.FLASH_CONCENTRATION),
      this.onByPlayerFlashConcentrationBuffRemoval,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FLASH_HEAL),
      this.onByPlayerFlashHealCast,
    );
  }

  onByPlayerFlashConcentrationBuff(event: ApplyBuffStackEvent) {
    console.log(event);
    console.log('it is a buff stack');
  }

  onByPlayerFlashConcentrationInitialBuff(event: ApplyBuffEvent) {
    console.log(event);
    console.log('it is the initial Buff');
  }

  onByPlayerFlashConcentrationBuffRemoval(event: RemoveBuffEvent) {
    this.totalDrops += 1;
    console.log(event);
    console.log('it is a buff removal');
  }

  onByPlayerFlashHealCast(event: CastEvent) {
    console.log(event);
    console.log('Flash Heal FTW!');
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.ITEMS} tooltip={<>Hello World</>}>
        <ItemHealingDone amount={125} />
        <SpellLink id={SPELLS.FLASH_CONCENTRATION.id}></SpellLink>
        You let the buff drop {this.totalDrops} times;
      </Statistic>
    );
  }

  suggestions(when: When) {
    when(this.suggestion).addSuggestion((suggest) =>
      suggest(
        <span>
          You used too many <SpellLink id={SPELLS.FLASH_HEAL.id} /> Jun!
        </span>,
      )
        .icon(SPELLS.FLASH_CONCENTRATION.icon)
        .staticImportance(SUGGESTION_IMPORTANCE.MAJOR),
    );
  }
}

export default FlashConcentration;
