import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Events, {CastEvent, RemoveBuffEvent, FightEndEvent, DamageEvent, EventType, ClassResources, EnergizeEvent, Ability} from 'parser/core/Events';
import EventEmitter from 'parser/core/modules/EventEmitter';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

const GOOD_BREATH_DURATION_MS = 25000;
const BREATH_COST_PER_TICK = 160;
const HYPOTHERMIC_PRESENCE_COST_REDUCTION = .35;

class BreathOfSindragosa extends Analyzer {
  static dependencies = {
    eventEmitter: EventEmitter,
  }

  protected eventEmitter!: EventEmitter;

  damageAbility!: Ability;
  triggeringCast!: CastEvent;
  
  beginTimestamp = 0;
  casts = 0;
  badCasts = 0;
  totalDuration = 0;
  breathActive = false;
  mostRecentTickTime = 0;
  currentRpAmount = 0;
  

  tickAmounts: number[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BREATH_OF_SINDRAGOSA_TALENT.id);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BREATH_OF_SINDRAGOSA_TALENT), this.onCast);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BREATH_OF_SINDRAGOSA_TALENT), this.onRemoveBuff);
    this.addEventListener(Events.fightend, this.onFightEnd);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BREATH_OF_SINDRAGOSA_TALENT_DAMAGE_TICK), this.onDamage)
    this.addEventListener(Events.energize.by(SELECTED_PLAYER), this.onEnergize);
  }

  onEnergize(event: EnergizeEvent) {
    if(!this.breathActive || !event.classResources) {
      return;
    }
    event.classResources
      .filter(resource => resource.type === RESOURCE_TYPES.RUNIC_POWER.id)
      .forEach(({ amount }) => {
        this.currentRpAmount = amount;
      });
  }

  onDamage(event: DamageEvent) {
    if (event.timestamp === this.mostRecentTickTime) {
      return;
    }

    if (!this.damageAbility) {
      this.damageAbility = event.ability;
    }

    this.tickAmounts.push(this.selectedCombatant.hasBuff(SPELLS.HYPOTHERMIC_PRESENCE_TALENT.id, event.timestamp) ? BREATH_COST_PER_TICK * (1 - HYPOTHERMIC_PRESENCE_COST_REDUCTION) : BREATH_COST_PER_TICK);
    this.mostRecentTickTime = event.timestamp;
  }

  sendFabricatedResources(event: RemoveBuffEvent | FightEndEvent) {
    const fabricatedResources: ClassResources & { cost: number } = {
      amount: this.currentRpAmount,
      max: 1000,
      type: RESOURCE_TYPES.RUNIC_POWER.id,
      cost: this.tickAmounts.reduce((a, b) => a + b, 0),
    }

    const fabricatedEvent: CastEvent = {
      type: EventType.Cast,
      ability: this.damageAbility,
      timestamp: event.timestamp,
      sourceID: this.triggeringCast.sourceID,
      targetID: this.triggeringCast.targetID,
      sourceIsFriendly: this.triggeringCast.sourceIsFriendly,
      targetIsFriendly: this.triggeringCast.targetIsFriendly,
      classResources: [fabricatedResources],
    }

    this.eventEmitter.fabricateEvent(fabricatedEvent, event);
    this.tickAmounts = [];
  }

  onCast(event: CastEvent) {
    this.casts += 1;
    this.beginTimestamp = event.timestamp;
    this.breathActive = true;
    this.triggeringCast = event;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.breathActive = false;
    const duration = event.timestamp - this.beginTimestamp;
    if (duration < GOOD_BREATH_DURATION_MS) {
      this.badCasts +=1;
    }
    this.totalDuration += duration;
    this.sendFabricatedResources(event);
  }

  onFightEnd(event: FightEndEvent) {
    if (this.breathActive) {
      this.casts -=1;
    }

    this.sendFabricatedResources(event);
  }

  suggestions(when: When){
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<> You are not getting good uptime from your <SpellLink id={SPELLS.BREATH_OF_SINDRAGOSA_TALENT.id} /> casts. A good cast is one that lasts 25 seconds or more.  To ensure a good duration, make sure you have 70+ Runic Power pooled and have less than 4 Runes available before you start the cast.  Also make sure to use <SpellLink id={SPELLS.EMPOWER_RUNE_WEAPON.id} /> within a few seconds of casting Breath of Sindragosa. Pay close attention to your Runic Power and make sure you are not overcapping. {this.tickingOnFinishedString}</>)
        .icon(SPELLS.BREATH_OF_SINDRAGOSA_TALENT.icon)
        .actual(i18n._(t('deathknight.frost.suggestions.breathOfSindragosa.uptime')`You averaged ${(this.averageDuration).toFixed(1)} seconds of uptime per cast`))
        .recommended(`>${recommended} seconds is recommended`));
  }

  get tickingOnFinishedString() {
    return this.breathActive ? "Your final cast was not counted in the average since it was still ticking when the fight ended" : "";
  }

  get averageDuration() {
    return ((this.totalDuration / this.casts) || 0) / 1000;
  }

  get suggestionThresholds() {
    return {
      actual: this.averageDuration,
      isLessThan: {
        minor: 25.0,
        average: 22.5,
        major: 20.0,
      },
      style: ThresholdStyle.SECONDS,
      suffix: 'Average',
    };
  }

  statistic() {
    return (
      <Statistic
        tooltip={`You cast Breath of Sindragosa ${this.casts} times for a combined total of ${(this.totalDuration / 1000).toFixed(1)} seconds.  ${this.badCasts} casts were under 25 seconds.  ${this.tickingOnFinishedString}`}
        position={STATISTIC_ORDER.CORE(60)}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.BREATH_OF_SINDRAGOSA_TALENT}>
          <>
           {(this.averageDuration).toFixed(1)}s  <small>average duration</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BreathOfSindragosa;
