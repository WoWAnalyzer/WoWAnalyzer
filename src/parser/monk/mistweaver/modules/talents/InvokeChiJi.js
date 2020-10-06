import React from 'react';
import SPELLS from 'common/SPELLS';
import {Trans} from '@lingui/macro';
import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { formatNumber, formatThousands } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemHealingDone from 'interface/ItemHealingDone';
import SpellLink from 'common/SpellLink';
import ItemManaGained from 'interface/ItemManaGained';


const MANA_REDUCED_PER_STACK = .33;
const MAX_STACKS = 3;

class InvokeChiJi extends Analyzer {
  //healing breakdown vars
  gustHealing = 0;
  envelopHealing = 0;
  //stack breakdown vars
  chijiStackCount = 0;
  castsBelowMaxStacks = 0;
  wastedStacks = 0;
  chijiActive = false;
  freeCasts = 0;
  manaSaved = 0;
  hasInnervate = false;
  hasManaTea = false;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id);
    if (!this.active) return;
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUST_OF_MISTS_CHIJI), this.handleGust);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_BREATH), this.handleEnvelopingBreath);
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_BUFF), this.handleApplyChijiStack);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_BUFF), this.handleApplyChijiStack);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_MIST), this.handleEnvelopCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT), this.handleChijiStart);
    this.addEventListener(Events.death.by(SELECTED_PLAYER_PET), this.handleChijiEnd);
  }

  //healing breakdown management
  handleGust(event) {
    this.gustHealing += (event.amount || 0) + (event.absorbed || 0);
  }

  handleEnvelopingBreath(event) {
    this.envelopHealing += (event.amount || 0) + (event.absorbed || 0);
  }
  // end

  //stackbreakown management
  handleChijiStart() {
    this.chijiActive = true;
  }

  handleChijiEnd() {
      this.chijiActive = false;
  }

  handleApplyChijiStack() {
      if (this.chijiStackCount === MAX_STACKS) {
          this.wastedStacks += 1;
      } else {
          this.chijiStackCount += 1;
    }
  }

  handleEnvelopCast(event) {
      //account for mana cost reductions
      let manaCost = event.rawResourceCost ? event.rawResourceCost[0] : 0;
      this.hasInnervate = (this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id));
      this.hasManaTea = (this.selectedCombatant.hasBuff(SPELLS.MANA_TEA_TALENT.id));

      if(this.hasInnervate) {
          manaCost = 0;
      } else if(this.hasManaTea) {
          manaCost /= 2;
      }

      if(this.chijiActive && this.selectedCombatant.hasBuff(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_BUFF.id)) {

        if (this.chijiStackCount === MAX_STACKS) {
          this.manaSaved += manaCost;
          this.freeCasts += 1;
        } else if (this.chijiStackCount < MAX_STACKS) {
          this.manaSaved += manaCost * this.chijiStackCount * MANA_REDUCED_PER_STACK;
          this.castsBelowMaxStacks += 1;
        }
      this.chijiStackCount = 0;
    }
  }
  //end

  statistic() {
    return (
        <Statistic
          position={STATISTIC_ORDER.OPTIONAL(50)}
          category={STATISTIC_CATEGORY.TALENTS}
          size="flexible"
          tooltip={
            <Trans>
                  Healing Breakdown:
                  <ul>
                    <li>{formatNumber(this.gustHealing)} healing from Chi-Ji Gust of Mist.</li>
                    <li>{formatNumber(this.envelopHealing)} healing from Enveloping Breath.</li>
                  </ul>
                  Stack Breakdown:
                    <ul>
                    <li>{formatNumber(this.freeCasts)} free Enveloping Mist cast(s).</li>
                    <li>{formatNumber(this.castsBelowMaxStacks)} Enveloping Mist cast(s) below max ({MAX_STACKS}) Chi-Ji stacks.</li>
                    <li>{formatNumber(this.wastedStacks)} stack(s) wasted from overcapping Chi-Ji stacks.</li>
                    <li>{formatThousands(this.manaSaved)} mana saved from consuming Chi-Ji stacks with Enveloping Mist.</li>
                    </ul>
            </Trans>
          }
        >
          <div className="pad">
            <label><SpellLink id={SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id} /></label>
            <div className="value"><ItemHealingDone amount={this.gustHealing + this.envelopHealing} /></div>
            <div className="value"><ItemManaGained amount={this.manaSaved} /></div>
          </div>
        </Statistic>
    );
  }
}

export default InvokeChiJi;
