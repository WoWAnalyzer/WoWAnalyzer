import React from 'react';
import SPELLS from 'common/SPELLS';
import {Trans} from '@lingui/macro';
import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { formatNumber, formatThousands } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemHealingDone from 'interface/ItemHealingDone';
import SpellLink from 'common/SpellLink';
import ItemManaGained from 'interface/ItemManaGained';

const MAX_STACKS = 3;

/** 
 * Blackout Kick, Totm BoKs, Rising Sun Kick and Spinning Crane Kick generate stacks of Invoke Chi-Ji, the Red Crane, which reduce the cast time and mana 
 * cost of Enveloping Mist by 33% per stack, up to 3 stacks.
 * These abilities also heal 2 nearby allies for a Gust of Mist heal.
 * Casting Enveloping Mist while Chiji is active applies Enveloping Breath on up to 6 nearby allies within 10 yards.
*/
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
  missedGlobals = 0;
  timeStamp = 0;

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
  handleChijiStart(event) {
    this.chijiActive = true;
    this.timeStamp = event.timeStamp;
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
      if(this.chijiActive && this.selectedCombatant.hasBuff(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_BUFF.id)) {
        if (this.chijiStackCount === MAX_STACKS) {
          this.freeCasts += 1;
        } else if (this.chijiStackCount < MAX_STACKS) {
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
                    </ul>
            </Trans>
          }
        >
          <div className="pad">
            <label><SpellLink id={SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id} /></label>
            <div className="value"><ItemHealingDone amount={this.gustHealing + this.envelopHealing} /></div>
            <div className="value">{this.missedGlobals} missed GCDs</div>
          </div>
        </Statistic>
    );
  }
}

export default InvokeChiJi;
