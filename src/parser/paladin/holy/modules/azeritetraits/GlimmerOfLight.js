import React from 'react';
import { Trans} from '@lingui/macro';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellLink from 'common/SpellLink';

import { formatNumber } from 'common/format';
import { formatPercentage } from 'common/format';

import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import ItemHealingDone from 'interface/ItemHealingDone';
import ItemDamageDone from 'interface/ItemDamageDone';
import Events from 'parser/core/Events';

import BeaconHealSource from '../beacons/BeaconHealSource.js';


/**
 * Glimmer of Light,	Azerite Power
 * Requires Paladin (Holy, Holy)
 * Holy Shock leaves a Glimmer of Light on the target for 30 sec.
 * When you Holy Shock, all targets with Glimmer of Light are damaged for 1076 or healed for 1587. (at ilvl 400)
 * Example Log: https://www.warcraftlogs.com/reports/TX4nzPy8WwrfLv97#fight=19&type=auras&source=5&ability=287280
 */

const BUFF_DURATION = 30;
export const GLIMMER_CAP_8_3 = 8;
export const IS_IT_8_3_YET = new Date() > new Date(2020, 1, 14);
const GLIMMER_CAP = IS_IT_8_3_YET ? GLIMMER_CAP_8_3 : 99;

class GlimmerOfLight extends Analyzer {
  static dependencies = {
    beaconHealSource: BeaconHealSource,
  };

  casts = 0;
  damage = 0;
  earlyRefresh = 0;
  glimmerBuffs/*: Array<ApplyBuffEvent | ApplyDebuffEvent>*/ = [];
  glimmerHits = 0;
  healing = 0;
  overCapHealing = 0;
  healingTransfered = 0;
  overCap = 0;
  wastedEarlyRefresh = 0;
  wastedOverCap = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.GLIMMER_OF_LIGHT_TRAIT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOLY_SHOCK_CAST), this.onCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GLIMMER_OF_LIGHT), this.onHeal);
    this.addEventListener(this.beaconHealSource.beacontransfer.by(SELECTED_PLAYER), this.onBeaconTransfer);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.GLIMMER_OF_LIGHT_DAMAGE), this.onDamage);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.GLIMMER_OF_LIGHT_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.applydebuff
        .by(SELECTED_PLAYER)
        .spell(SPELLS.GLIMMER_OF_LIGHT_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.GLIMMER_OF_LIGHT_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.removedebuff
        .by(SELECTED_PLAYER)
        .spell(SPELLS.GLIMMER_OF_LIGHT_BUFF),
      this.onRemoveBuff,
    );
  }

  onBeaconTransfer(event) {
    const spellId = event.originalHeal.ability.guid;
    if (spellId !== SPELLS.GLIMMER_OF_LIGHT.id) {
      return;
    }
    this.healingTransfered += event.amount + (event.absorbed || 0);
  }

  onApplyBuff(event/*: ApplyBuffEvent | ApplyDebuffEvent*/) {
    this.glimmerBuffs.unshift(event);
  }
  onRemoveBuff(event/*: RemoveBuffEvent | RemoveDebuffEvent*/) {
    this.glimmerBuffs = this.glimmerBuffs.filter(
      buff => buff.targetID !== event.targetID,
    );
  }

  onCast(event) {
    this.casts += 1;

    const index = this.glimmerBuffs.findIndex(g => g.targetID === event.targetID);

    if (this.glimmerBuffs.length >= GLIMMER_CAP) {
      // Cast a new one while at cap (applybuff will occur later, so this will be accurate)
      this.overCap += 1;
      if (index < 0) {
        this.wastedOverCap += BUFF_DURATION * 1000 - (event.timestamp - this.glimmerBuffs[GLIMMER_CAP - 1].timestamp);
      } else {
        this.wastedOverCap += BUFF_DURATION * 1000 - (event.timestamp - this.glimmerBuffs[index].timestamp);
      }
    } else if (index >= 0) {
      // if an active glimmer was overwritten //
      this.wastedEarlyRefresh += BUFF_DURATION * 1000 - (event.timestamp - this.glimmerBuffs[index].timestamp);
      this.earlyRefresh += 1;
    }
  }

  onDamage(event){
    this.damage += event.amount + (event.absorbed || 0);
    this.glimmerHits += 1;
  }

  onHeal(event) {
    this.healing += event.amount + (event.absorbed || 0);
    this.glimmerHits += 1;
  }

  get hitsPerCast(){
    return this.glimmerHits / this.casts;
    }

  get holyShocksPerMinute(){
    return this.casts / (this.owner.fightDuration / 60000);
  }

  get totalHealing() {
    return this.healing + this.healingTransfered;
  }

  get earlyGlimmerRefreshLoss() {
    return this.wastedEarlyRefresh / (this.casts * BUFF_DURATION * 1000);
  }

  get overCapGlimmerLoss(){
    return this.wastedOverCap / (this.casts * BUFF_DURATION * 1000);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.GLIMMER_OF_LIGHT.id}
        value={(
          <>
            <ItemHealingDone amount={this.totalHealing} /><br />
            <ItemDamageDone amount={this.damage} /><br />
            {this.hitsPerCast.toFixed(1)} Triggers/Cast
          </>
        )}
        tooltip={(
          <>
            Total healing done: <b>{formatNumber(this.totalHealing)}</b><br />
            Beacon healing transfered: <b>{formatNumber(this.healingTransfered)}</b><br />
            Glimmer damage: <b>{formatNumber(this.damage)}</b><br />
            Holy Shocks/minute: <b>{this.holyShocksPerMinute.toFixed(1)}</b><br />
            Early refresh(s): <b>{this.earlyRefresh}</b><br />
            Lost to early refresh: <b>{(this.wastedEarlyRefresh/1000).toFixed(1)}(sec) {(this.earlyGlimmerRefreshLoss * 100).toFixed(1)}%</b><br />
            Glimmer of Lights over {GLIMMER_CAP} buff cap: <b>{this.overCap}</b><br />
            Lost to over capping: <b>{(this.wastedOverCap/1000).toFixed(1)}(sec) {(this.overCapGlimmerLoss * 100).toFixed(1)}%</b><br />
          </>
        )}
      />
    );
  }

  get suggestEarlyRefresh() {
    return {
      actual: this.earlyGlimmerRefreshLoss,
      isGreaterThan: {
        minor: 0.15,
        average: 0.25,
        major: 0.35,
      },
      style: 'percentage',
    };
  }

  get suggestGlimmerCap() {
    return{
      actual: this.overCapGlimmerLoss,
      isGreaterThan: {
        minor: 0.15,
        average: 0.25,
        major: 0.35,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    if (this.owner.builds.GLIMMER.active){
      when(this.suggestEarlyRefresh).addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <Trans>
            Your usage of <SpellLink id={SPELLS.GLIMMER_OF_LIGHT.id} /> can be improved.
            To maximize the healing/damage done by <SpellLink id={SPELLS.GLIMMER_OF_LIGHT.id} />, try to keep as many buffs up as possible.
            Avoid overwritting buffs early, this suggestion does not take priority over healing targets with low health.
            If two targets have similar health pools priorize the target without a glimmer as your <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} /> will heal all players with active buffs.
          </Trans>,
        )
          .icon(SPELLS.GLIMMER_OF_LIGHT.icon)
          .actual(`Uptime lost to early Glimmer refresh was ${formatPercentage(this.earlyGlimmerRefreshLoss)}%`)
          .recommended(`< ${this.suggestEarlyRefresh.isGreaterThan.minor * 100}% is recommended`);
      });
    }

    if (this.owner.builds.GLIMMER.active){
      when(this.suggestGlimmerCap).addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <Trans>
            Patch 8.3 implemented a <a href="https://www.wowhead.com/news=295502.3/blizzard-official-class-changes-for-patch-8-3-visions-of-nzoth">glimmer cap </a>
            limiting the number of active <SpellLink id={SPELLS.GLIMMER_OF_LIGHT.id} /> buffs to {GLIMMER_CAP}.<br />
            Avoid stacking haste cooldowns to prevent over-capping on <SpellLink id={SPELLS.GLIMMER_OF_LIGHT.id} />.
            <a href="https://questionablyepic.com/glimmer-8-3/">More info here.</a>
          </Trans>,
        )
        .icon(SPELLS.GLIMMER_OF_LIGHT.icon)
        .actual(`Uptime lost to overcapping active Glimmers was ${formatPercentage(this.overCapGlimmerLoss)}%`)
        .recommended(`< ${this.suggestGlimmerCap.isGreaterThan.minor * 100}% is reccommended`);
      });
    }
  }
}

export default GlimmerOfLight;
