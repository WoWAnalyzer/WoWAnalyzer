import React from 'react';

import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Events, { DamageEvent, ApplyDebuffEvent, RemoveDebuffEvent, FightEndEvent } from 'parser/core/Events';
import EventHistory from 'parser/shared/modules/EventHistory';
import EnemyInstances from 'parser/shared/modules/EnemyInstances';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import { formatPercentage } from 'common/format';
import Statistic from 'parser/ui/Statistic';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { MS_BUFFER_1000 } from 'parser/mage/shared/constants';
import { Trans } from '@lingui/macro';

const WINTERS_CHILL_SPENDERS = [
  SPELLS.ICE_LANCE_DAMAGE,
  SPELLS.GLACIAL_SPIKE_DAMAGE,
  SPELLS.ICE_NOVA_TALENT,
  SPELLS.RAY_OF_FROST_TALENT,
];

const WINTERS_CHILL_PRECAST_CASTS = [
  SPELLS.FROSTBOLT,
  SPELLS.EBONBOLT_TALENT,
  SPELLS.GLACIAL_SPIKE_TALENT,
  SPELLS.RADIANT_SPARK,
]

const WINTERS_CHILL_PRECAST_DAMAGE = [
SPELLS.FROSTBOLT_DAMAGE,
SPELLS.EBONBOLT_DAMAGE,
SPELLS.GLACIAL_SPIKE_DAMAGE,
];

const debug = false;

class WintersChill extends Analyzer {
  static dependencies = {
    enemies: EnemyInstances,
    eventHistory: EventHistory,
  };
  protected enemies!: EnemyInstances;
  protected eventHistory!: EventHistory;

  hasGlacialSpike: boolean;
  hasEbonbolt: boolean;
  isKyrian: boolean;
  isVenthyr: boolean;

  wintersChillApplied = false;
  buffRemovedTimestamp = 0;
  missedPreCasts = 0;
  missedShatters = 0;
  totalChillStacks = 0;
  preCastFound = false;
  preCastIgnored = false;
  preCastID = 0;
  preCastTimestamp = 0;
  shatteredCasts = 0;
  shatteredCastIDs: number[] = [];


  constructor(options: Options) {
    super(options);
    this.hasGlacialSpike = this.selectedCombatant.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id);
    this.hasEbonbolt = this.selectedCombatant.hasTalent(SPELLS.EBONBOLT_TALENT.id);
    this.isKyrian = this.selectedCombatant.hasCovenant(COVENANTS.KYRIAN.id);
    this.isVenthyr = this.selectedCombatant.hasCovenant(COVENANTS.VENTHYR.id);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(WINTERS_CHILL_PRECAST_DAMAGE), this.onWintersChillPreCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(WINTERS_CHILL_SPENDERS), this.onWintersChillSpender);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.WINTERS_CHILL), this.onWintersChillApplied);
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.WINTERS_CHILL), this.onWintersChillRemoved);
    this.addEventListener(Events.fightend, this.onFinished);

  }

  onWintersChillApplied(event: ApplyDebuffEvent) {
    //If Winters Chill is still applied (it was reapplied before it was fully used up) then we need to check usage before we reset debuff
    if (this.wintersChillApplied) {
      if (!this.preCastFound && !this.preCastIgnored) {
        this.missedPreCasts += 1;
        debug && this.log("MISSED PRE CAST");
      }
      this.missedShatters += 2 - this.shatteredCasts
    }

    this.wintersChillApplied = true;
    this.preCastFound = false;
    this.preCastIgnored = false;
    this.preCastID = 0;
    this.preCastTimestamp = 0;
    this.shatteredCasts = 0;
    this.shatteredCastIDs = [];
    this.totalChillStacks += 2;
    const preCast = this.eventHistory.last(1, 1000, Events.cast.by(SELECTED_PLAYER).spell(WINTERS_CHILL_PRECAST_CASTS))[0]
    if (preCast) {
      this.preCastID = preCast.ability.guid;
      this.preCastTimestamp = preCast.timestamp;
    }
  }

  onWintersChillPreCast(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.WINTERS_CHILL.id)) {
      return;
    }

    //Ensure that the precast we found when Winter's Chill was applied actually landed into Winter's Chill
    if (event.timestamp - this.preCastTimestamp < MS_BUFFER_1000) {
      this.preCastFound = true;
    }

    //If the player is Kyrian and used Radiant Spark as their precast, ignore the precast check
    if (this.preCastID === SPELLS.RADIANT_SPARK.id) {
      this.preCastIgnored = true;
      debug && this.log("PRE CAST IGNORED");
    }
  }

  onWintersChillSpender(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.WINTERS_CHILL.id)) {
      return;
    }

    //If the player is Venthyr and the target has Mirrors of Torment, then we need to ignore the precast
    //We are doing this here because it is the only events where we can get the target debuffs
    if (enemy.hasBuff(SPELLS.MIRRORS_OF_TORMENT.id)) {
      this.preCastIgnored = true;
      debug && this.log("PRE CAST IGNORED");
    }

    this.shatteredCasts += 1;
    this.shatteredCastIDs.push(event.ability.guid);
  }

  onWintersChillRemoved(event: RemoveDebuffEvent) {
    if (!this.preCastFound && !this.preCastIgnored) {
      this.missedPreCasts += 1;
      debug && this.log("MISSED PRE CAST");
    }
    this.missedShatters += 2 - this.shatteredCasts;

    this.wintersChillApplied = false;
    this.buffRemovedTimestamp = event.timestamp;

    if (debug) {
      this.log("Pre Cast Found: " + this.preCastFound);
      this.log("Pre Cast Ignored: " + this.preCastIgnored);
      this.log("Pre Cast ID: " + this.preCastID);
      this.log("Pre Cast Timestamp: " + this.preCastTimestamp);
      this.log("Shattered Casts: " + this.shatteredCasts);
      this.log("Shattered Cast IDs: " + this.shatteredCastIDs);
    }
  }

  onFinished(event: FightEndEvent) {
    if (event.timestamp !== this.buffRemovedTimestamp) {
      return;
    }

    //If there was a Winters Chill applied that had not been removed yet when the fight ended, adjust the total chill stacks and missed shatters to account for what the player didnt have time to use
    //Only reduce the total and missed numbers by the amount that was unused. So if they shattered one of the 2 casts then only reduce by 1.
    this.totalChillStacks -= 2 -  this.shatteredCasts;
    this.missedShatters -= 2 - this.shatteredCasts;
  }

  get totalProcs() {
    return this.totalChillStacks / 2;
  }

  get shatterMissedPercent() {
    return this.missedShatters / this.totalChillStacks;
  }

  get shatterUtil() {
    return 1 - this.shatterMissedPercent;
  }

  get precastMissedPercent() {
    return (this.missedPreCasts / this.totalProcs) || 0;
  }

  get precastUtil() {
    return 1 - this.precastMissedPercent;
  }

  // less strict than the ice lance suggestion both because it's less important,
  // and also because using a Brain Freeze after being forced to move is a good excuse for missing the hardcast.
  get wintersChillHardCastThresholds() {
    return {
      actual: this.precastUtil,
      isLessThan: {
        minor: 0.90,
        average: 0.80,
        major: 0.60,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get wintersChillShatterThresholds() {
    return {
      actual: this.shatterUtil,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: 0.75,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.wintersChillShatterThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You failed to properly take advantage of <SpellLink id={SPELLS.WINTERS_CHILL.id} /> on your target {this.missedShatters} times ({formatPercentage(this.shatterMissedPercent)}%). After debuffing the target via <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> and <SpellLink id={SPELLS.FLURRY.id} />, you should ensure that you hit the target with {this.hasGlacialSpike ? <>a <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> and an <SpellLink id={SPELLS.ICE_LANCE.id} /> (If Glacial Spike is available), or </> : ''} two <SpellLink id={SPELLS.ICE_LANCE.id} />s before the <SpellLink id={SPELLS.WINTERS_CHILL.id} /> debuff expires to get the most out of <SpellLink id={SPELLS.SHATTER.id} />.</>)
          .icon(SPELLS.ICE_LANCE.icon)
          .actual(<Trans id="mage.frost.suggestions.wintersChill.notShatteredIceLance">{formatPercentage(this.shatterMissedPercent)}% Winter's Chill not shattered with Ice Lance</Trans>)
          .recommended(`${formatPercentage(1 - recommended)}% is recommended`));
    when(this.wintersChillHardCastThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You failed to use a pre-cast ability before spending your <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> {this.missedPreCasts} times ({formatPercentage(this.precastMissedPercent)}%). Because of the travel time of <SpellLink id={SPELLS.FLURRY.id} />, you should cast a damaging ability such as <SpellLink id={SPELLS.FROSTBOLT.id} /> {this.hasEbonbolt ? <>or <SpellLink id={SPELLS.EBONBOLT_TALENT.id} /></> : ''} immediately before using your instant cast <SpellLink id={SPELLS.FLURRY.id} />. Doing this will allow your pre-cast ability to hit the target after <SpellLink id={SPELLS.FLURRY.id} /> (unless you are standing too close to the target) allowing it to benefit from <SpellLink id={SPELLS.SHATTER.id} />. If you are a Kyrian, it is also acceptable to pre-cast <SpellLink id={SPELLS.RADIANT_SPARK.id} /> instead.</>)
          .icon(SPELLS.FROSTBOLT.icon)
          .actual(<Trans id="mage.frost.suggestions.wintersChill.notShattered">{formatPercentage(this.precastMissedPercent)}% Winter's Chill not shattered with Frostbolt, Glacial Spike, or Ebonbolt</Trans>)
          .recommended(`${formatPercentage(1 - recommended)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(30)}
        size="flexible"
        tooltip={(
          <>
            When using your Brain Freeze procs, you should always ensure that you have something immediately before it (Like Frostbolt, Ebonbolt, or Radiant Spark) as well as 2 Ice Lance Casts (Or Glacial Spike + Ice Lance) immediately after to get the most out of the Winter's Chill debuff that is applied to the target. Doing so will allow the cast before and the 2 casts after to all benefit from Shatter. Note that if you are very close to your target, then the ability you used immediately before Flurry might hit the target too quickly and not get shattered.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.WINTERS_CHILL}>
          <SpellIcon id={SPELLS.WINTERS_CHILL.id} /> {formatPercentage(this.shatterUtil, 0)}% <small>Spells shattered</small><br />
          <SpellIcon id={SPELLS.FROSTBOLT.id} /> {formatPercentage(this.precastUtil, 0)}% <small>Pre-casts shattered</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WintersChill;
