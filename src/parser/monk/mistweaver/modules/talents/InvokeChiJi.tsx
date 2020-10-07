import React from 'react';
import SPELLS from 'common/SPELLS';
import {Trans} from '@lingui/macro';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import Events from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemHealingDone from 'interface/ItemHealingDone';
import SpellLink from 'common/SpellLink';

const MAX_STACKS = 3;

/** 
 * Blackout Kick, Totm BoKs, Rising Sun Kick and Spinning Crane Kick generate stacks of Invoke Chi-Ji, the Red Crane, which reduce the cast time and mana 
 * cost of Enveloping Mist by 33% per stack, up to 3 stacks.
 * These abilities also heal 2 nearby allies for a Gust of Mist heal.
 * Casting Enveloping Mist while Chiji is active applies Enveloping Breath on up to 6 nearby allies within 10 yards.
*/
class InvokeChiJi extends Analyzer {
  chijiActive = false;
  //healing breakdown vars
  gustHealing = 0;
  envelopHealing = 0;
  //stack breakdown vars
  chijiStackCount = 0;
  castsBelowMaxStacks = 0;
  wastedStacks = 0;
  freeCasts = 0;
  //missed GCDs vars
  missedGlobals = 0;
  chijiStart = 0;
  chijiGlobals = 0;
  chijiUses = 0;
  lastGlobal = 0;
  
class InvokeChiJi extends Analyzer {
  gustHealing: number = 0;
  envelopHealing: number = 0;

  constructor(args: Options) {
    super(args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id);
    if (!this.active) {return;}
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUST_OF_MISTS_CHIJI), this.handleGust);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_BREATH), this.handleEnvelopingBreath);
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_BUFF), this.handleApplyChijiStack);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_BUFF), this.handleApplyChijiStack);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_MIST), this.handleEnvelopCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT), this.handleChijiStart);
    this.addEventListener(Events.GlobalCooldown.by(SELECTED_PLAYER), this.handleGlobal);
  }

  //missed gcd mangement
  handleChijiStart(event: CastEvent) {
    this.chijiActive = true;
    this.chijiStart = this.lastGlobal = event.timestamp;
    this.chijiGlobals += 1;
    this.chijiUses +=1;
  }

  handleGlobal(event: GlobalCooldownEvent){
    //cant get eventlistener to find chiji's death so we will check against duration here
    if(event.timestamp - this.chijiStart > SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.duration) {
      this.chijiActive = false;
    }
    if(this.chijiActive) {
      this.chijiGlobals += 1;
      //if timebetween globals is longer than the gcd add the difference to the missed gcd tally
      //we dont care about accounting for channels/casts longer than the gcd since you shouldnt be using them during chiji anyway
      if((event.timestamp - this.lastGlobal) > event.duration) {
        this.missedGlobals += (event.timestamp - this.lastGlobal - event.duration)/event.duration;
      }
      this.lastGlobal = event.timestamp;
    }
  }

  handleGust(event: HealEvent) {
    this.gustHealing += (event.amount || 0) + (event.absorbed || 0);
  }

  handleEnvelopingBreath(event: HealEvent) {
    this.envelopHealing += (event.amount || 0) + (event.absorbed || 0);
  }
  
  //stackbreakown management
  handleApplyChijiStack() {
      if (this.chijiStackCount === MAX_STACKS) {
          this.wastedStacks += 1;
      } else {
          this.chijiStackCount += 1;
    }
  }

  handleEnvelopCast(event: CastEvent) {
    //in some cases the last envelop is cast after chiji has expired but the buff can still be consumed
      if(this.chijiActive || this.selectedCombatant.hasBuff(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_BUFF.id)) {
        if (this.chijiStackCount === MAX_STACKS) {
          this.freeCasts += 1;
        } else if (this.chijiStackCount < MAX_STACKS) {
          this.castsBelowMaxStacks += 1;
        }
      this.chijiStackCount = 0;
    }
  }

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
                  Activity:
                    <ul>
                    <li>{(this.chijiGlobals/this.chijiUses).toFixed(2)} average gcds inside Chi-Ji window</li>
                    </ul>
            </Trans>
          }
        >
          <div className="pad">
            <label><SpellLink id={SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id} /></label>
            <div className="value"><ItemHealingDone amount={this.gustHealing + this.envelopHealing} /></div>
            <div className="value">{formatNumber(this.missedGlobals)} missed GCDs
            </div>
          </div>
        </Statistic>
    );
  }
}

export default InvokeChiJi;
