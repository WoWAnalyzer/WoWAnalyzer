import React from 'react';
import SPELLS from 'common/SPELLS';
import {Trans} from '@lingui/macro';
import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import Events from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemHealingDone from 'interface/ItemHealingDone';
import SpellLink from 'common/SpellLink';
import StatTracker from 'parser/shared/modules/StatTracker';

/** 
 * Blackout Kick, Totm BoKs, Rising Sun Kick and Spinning Crane Kick generate stacks of Invoke Chi-Ji, the Red Crane, which reduce the cast time and mana 
 * cost of Enveloping Mist by 33% per stack, up to 3 stacks.
 * These abilities also heal 2 nearby allies for a Gust of Mist heal.
 * Casting Enveloping Mist while Chiji is active applies Enveloping Breath on up to 6 nearby allies within 10 yards.
*/
class InvokeChiJi extends Analyzer {
  static dependencies = {statTracker: StatTracker};
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
  efChannelStart = 0;
  efChannelEnd = 0;
  
  envCount = 0;
  
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id);
    if (!this.active) {return;}
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUST_OF_MISTS_CHIJI), this.handleGust);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_BREATH), this.handleEnvelopingBreath);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_MIST), this.handleEnvelopCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT), this.handleChijiStart);
    this.addEventListener(Events.death.to(SELECTED_PLAYER_PET), this.handleChijiDeath);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.BLACKOUT_KICK, SPELLS.RISING_SUN_KICK_SECOND, SPELLS.BLACKOUT_KICK_TOTM]), this.handleOvercapStacks)
    //need a different eventlistener beacause chiji currently only applies 1 stack per cast of sck, not on each dmg event
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SPINNING_CRANE_KICK), this.handleOvercapStacks);
    this.addEventListener(Events.GlobalCooldown.by(SELECTED_PLAYER), this.handleGlobal);
    this.addEventListener(Events.BeginChannel.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_FONT), this.handleEssenceFontStart);
    this.addEventListener(Events.EndChannel.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_FONT), this.handleEssenceFontEnd);
  }

  //missed gcd mangement
  handleChijiStart(event) {
    this.chijiActive = true;
    this.chijiStart = this.lastGlobal = event.timestamp;
    this.chijiGlobals += 1;
    this.chijiUses +=1;
  }
  
  handleChijiDeath(event) {
    this.chijiActive = false;
  }

  handleGlobal(event){
    if(this.chijiActive) {
      this.chijiGlobals += 1;
      //if timebetween globals is longer than the gcd add the difference to the missed gcd tally
      //we only care about accounting for channels of essence font during WoO, other than that it should be the gcd during chiji
      if(event.ability.guid === SPELLS.ESSENCE_FONT.id && this.selectedCombatant.hasBuff(SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL.id)) {
        return;
      } else if((event.timestamp - this.lastGlobal) > event.duration) {
        this.missedGlobals += (event.timestamp - this.lastGlobal - event.duration)/event.duration;
      }
      this.lastGlobal = event.timestamp;
    }
  }

  handleEssenceFontStart(event) { 
    if(this.selectedCombatant.hasBuff(SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL.id)) { 
       this.efChannelStart = this.lastGlobal = event.timestamp;
    }
  }

  handleEssenceFontEnd(event) {
    const gcd = 1500 / (1 + this.statTracker.hastePercentage(this.statTracker.currentHasteRating));
    if(this.selectedCombatant.hasBuff(SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL.id)) { 
      this.efChannelEnd = event.timestamp;
      let duration = this.efChannelEnd - this.efChannelStart;
      if(duration > gcd) { 
        this.lastGlobal =  this.efChannelEnd - gcd;
      }
   }
  }

  //healing management
  handleGust(event) {
    this.gustHealing += (event.amount || 0) + (event.absorbed || 0);
  }

  handleEnvelopingBreath(event) {
    this.envelopHealing += (event.amount || 0) + (event.absorbed || 0);
  }
  
  //stackbreakown management
  handleOvercapStacks(event) {
    if(this.chijiActive) {
      if(this.chijiStackCount === SPELLS.INVOKE_CHIJI_THE_RED_CRANE_BUFF.maxStacks) {
        this.wastedStacks += 1;
      } else {
        this.chijiStackCount += 1;
      }
    }
  }

  handleEnvelopCast() {
    //in some cases the last envelop is cast after chiji has expired but the buff can still be consumed
      if(this.chijiActive || this.selectedCombatant.hasBuff(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_BUFF.id)) {
        if (this.chijiStackCount === SPELLS.INVOKE_CHIJI_THE_RED_CRANE_BUFF.maxStacks) {
          this.freeCasts += 1;
        } else if (this.chijiStackCount < SPELLS.INVOKE_CHIJI_THE_RED_CRANE_BUFF.maxStacks) {
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
                    <li>{formatNumber(this.castsBelowMaxStacks)} Enveloping Mist cast(s) below max ({SPELLS.INVOKE_CHIJI_THE_RED_CRANE_BUFF.maxStacks}) Chi-Ji stacks.</li>
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
