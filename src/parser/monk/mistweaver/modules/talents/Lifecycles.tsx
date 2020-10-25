import React from 'react';
import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Statistic from 'interface/statistics/Statistic';
import BoringValueText from 'interface/statistics/components/BoringValueText'
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import SpellLink from 'common/SpellLink';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';


const LC_MANA_PER_SECOND_RETURN_MINOR: number = 40; //since its based on mp5 and mana & mp5 got halved going into SL we're gonna just halve this value too (80 -> 40)
const LC_MANA_PER_SECOND_RETURN_AVERAGE: number = LC_MANA_PER_SECOND_RETURN_MINOR - 15;
const LC_MANA_PER_SECOND_RETURN_MAJOR: number = LC_MANA_PER_SECOND_RETURN_MINOR - 15;
const CHIJI_MANA_SAVED_PER_STACK: number = 1001;
const MAX_CHIJI_STACKS: number = 3;

const debug: boolean = false;

class Lifecycles extends Analyzer {
  manaSaved: number = 0;
  manaSavedViv: number = 0;
  manaSavedEnm: number = 0;
  castsRedEnm: number = 0;
  castsRedViv: number = 0;
  castsNonRedViv: number = 0;
  castsNonRedEnm: number = 0;

  constructor(options: Options){
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.LIFECYCLES_TALENT.id);
    if(!this.active){
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.vivifyCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_MIST), this.envelopingMistCast);
  }

  vivifyCast(event: CastEvent){
    // Checking for TFT->Viv and classify as non-reduced Viv
    if(this.selectedCombatant.hasBuff(SPELLS.THUNDER_FOCUS_TEA.id) || this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)) {
      return;
    }
    if(!this.selectedCombatant.hasBuff(SPELLS.LIFECYCLES_VIVIFY_BUFF.id)) {
      this.castsNonRedViv += 1;
      return;
    }
    this.manaSaved += SPELLS.VIVIFY.manaCost * (SPELLS.LIFECYCLES_VIVIFY_BUFF.manaPercRed);
    this.manaSavedViv += SPELLS.VIVIFY.manaCost * (SPELLS.LIFECYCLES_VIVIFY_BUFF.manaPercRed);
    this.castsRedViv += 1;
    debug && console.log('Viv Reduced');
  }

  envelopingMistCast(event: CastEvent){
    if(this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)) {
      return;
    }
    // Checking to ensure player has cast Enveloping Mists and has the mana reduction buff
    if(!this.selectedCombatant.hasBuff(SPELLS.LIFECYCLES_ENVELOPING_MIST_BUFF.id)) {
      this.castsNonRedEnm += 1;
      return;
    }
    // Checking for chiji stacks and determine mana reduction
    const chijiStacksAtEnvCast = this.selectedCombatant.getBuff(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_BUFF.id, event.timestamp)?.stacks;
    if(!chijiStacksAtEnvCast) {
      this.calculateEnvManaSaved(SPELLS.ENVELOPING_MIST.manaCost);
      return;
    }
    //check for free cast from chiji
    if(chijiStacksAtEnvCast === MAX_CHIJI_STACKS) {
      return;
    }
    //have to do this weird because blizzard decided to make each chiji stack reduce the mana cost by 1001 instead of and exact 33%
    const modifiedManaCost = SPELLS.ENVELOPING_MIST.manaCost - (CHIJI_MANA_SAVED_PER_STACK * chijiStacksAtEnvCast);
    this.calculateEnvManaSaved(modifiedManaCost); 
  }

  calculateEnvManaSaved(manaCost: number) { 
    this.manaSaved += (manaCost * SPELLS.LIFECYCLES_ENVELOPING_MIST_BUFF.manaPercRed);
    this.manaSavedEnm += (manaCost * SPELLS.LIFECYCLES_ENVELOPING_MIST_BUFF.manaPercRed);
    this.castsRedEnm += 1;
    debug && console.log('Env Reduced');
  }

  get suggestionThresholds() {
    return {
      actual: this.manaSaved,
      isLessThan: {
        minor: LC_MANA_PER_SECOND_RETURN_MINOR * (this.owner.fightDuration / 1000),
        average: LC_MANA_PER_SECOND_RETURN_AVERAGE * (this.owner.fightDuration / 1000),
        major: LC_MANA_PER_SECOND_RETURN_MAJOR * (this.owner.fightDuration / 1000),
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(
          <>
            Your current spell usage is not taking full advantage of the <SpellLink id={SPELLS.LIFECYCLES_TALENT.id} /> talent. You should be trying to alternate the use of these spells as often as possible to take advantage of the buff.
          </>,
        )
          .icon(SPELLS.LIFECYCLES_TALENT.icon)
          .actual(`${formatNumber(actual)}${i18n._(t('monk.mistweaver.suggestions.lifecycles.manaSaved')` mana saved through Lifecycles`)}`)
          .recommended(`${formatNumber(recommended)} is the recommended amount of mana savings`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(70)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
            You saved a total of {this.manaSaved} mana from the Lifecycles talent.
            <ul>
              <li>On {this.castsRedViv} Vivify casts, you saved {(this.manaSavedViv / 1000).toFixed(0)}k mana. ({formatPercentage(this.castsRedViv / (this.castsRedViv + this.castsNonRedViv))}%)</li>
              <li>On {this.castsRedEnm} Enveloping Mists casts, you saved {(this.manaSavedEnm / 1000).toFixed(0)}k mana. ({formatPercentage(this.castsRedEnm / (this.castsRedEnm + this.castsNonRedEnm))}%)</li>
              <li>You casted {this.castsNonRedViv} Vivify's and {this.castsNonRedEnm} Enveloping Mists for full mana cost.</li>
            </ul>
          </>
        )}
      >
        <BoringValueText 
          label={<><SpellLink id={SPELLS.LIFECYCLES_TALENT.id} /></>}
        >
          <>
            {formatNumber(this.manaSaved)} Mana Saved
          </>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default Lifecycles;
