import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Statistic from 'interface/statistics/Statistic';
import BoringValueText from 'interface/statistics/components/BoringValueText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import { t } from '@lingui/macro';

const GREED_INNERVATE = 9000;
const SMART_INNERVATE = GREED_INNERVATE/2;

class Innervate extends Analyzer {

  casts = 0;
  castsOnYourself = 0;
  manaSaved = 0;
  reduction = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.trackCastsDuringInnervate);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.INNERVATE), this.handleInnervateCasts);
  }

  trackCastsDuringInnervate(event: CastEvent){
    const manaEvent = event.rawResourceCost;
    if(manaEvent === undefined){
      return;
    }

    // don't count innervate because its kind of implied
    if(event.ability.guid === SPELLS.INNERVATE.id){
      return;
    }

    //okay what did we actually do in innervate
    if(this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)){
      //checks if the spell costs anything (we don't just use cost since some spells don't play nice)
      if (Object.keys(manaEvent).length !== 0) {
        this.manaSaved += manaEvent[0] * this.reduction;
      }
    }
  }
  
  handleInnervateCasts(event: CastEvent){
    this.reduction = .5;
    this.casts += 1;
    if(event.targetID === event.sourceID){
      this.castsOnYourself += 1;
      this.reduction = 1;
    }
  }

  get selfCastThresholds() {
    return {
      actual: this.castsOnYourself,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 0,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get manaSavedPerInnervate() {
    if(this.casts === 0){
      return 0;
    }
    return this.manaSaved / this.casts;
  }

  // tldr they could cheese this threshold if they just cast on self the whole time so we scale it for that
  get realManaSavedThreshold() {
    if(this.casts === 0){
      return SMART_INNERVATE;
    }
    return (this.castsOnYourself * GREED_INNERVATE + (this.casts - this.castsOnYourself) * SMART_INNERVATE) / this.casts;
  }

  get manaSavedThresholds() {
    const minor = this.realManaSavedThreshold;
    return {
      actual: this.manaSavedPerInnervate,
      isLessThan: {
        minor: minor,
        average: minor * .8,
        major: minor * .6,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.selfCastThresholds).addSuggestion((suggest, actual, recommended) => suggest(
      <>
        You should aim to cast <SpellLink id={SPELLS.INNERVATE.id} /> on your allies to maximize the amount of mana saved over the raid.
      </>,
    )
      .icon(SPELLS.INNERVATE.icon)
      .actual(`${this.castsOnYourself} ${t({
      id: "druid.resto.suggestions.innervate.selfCasts",
      message: `time(s) you casted innervate on yourself`
    })}`)
      .recommended(`0 self casts are recommended.`));

      when(this.manaSavedThresholds).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          Your mana spent during <SpellLink id={SPELLS.INNERVATE.id} /> can be improved. Aim to cast <SpellLink id={SPELLS.EFFLORESCENCE_HEAL.id} /> and <SpellLink id={SPELLS.WILD_GROWTH.id} /> during this window while filling the remaining gcds with <SpellLink id={SPELLS.REJUVENATION.id} />.
        </>,
      )
        .icon(SPELLS.INNERVATE.icon)
        .actual(`${formatNumber(this.manaSavedPerInnervate)} ${t({
        id: "druid.resto.suggestions.innervate.avgManaSaved",
        message: `average mana saved per Innervate cast`
      })}`)
        .recommended(`${(recommended / 1000).toFixed(0)}k average mana saved is recommended`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(25)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <BoringValueText
          label={<><SpellIcon id={SPELLS.INNERVATE.id} /> Average mana saved</>}
        >
          <>
            {formatNumber(this.manaSavedPerInnervate)}
          </>
        </BoringValueText>
      </Statistic>
    );
  }

}
export default Innervate;