import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

<<<<<<< HEAD:src/parser/shaman/elemental/modules/talents/StormElemental.tsx
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import EnemyInstances from 'parser/shared/modules/EnemyInstances';

import Abilities from 'parser/shaman/elemental/modules/Abilities';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import Statistic from 'interface/statistics/Statistic';
import SpellLink from 'common/SpellLink';
=======
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import EnemyInstances from 'parser/shared/modules/EnemyInstances';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import Events from 'parser/core/Events';

import Abilities from '../Abilities';
>>>>>>> upstream/shadowlands:src/parser/shaman/elemental/modules/talents/StormElemental.js

const STORMELE_DURATION = 30000 - 1500;
class StormElemental extends Analyzer {

  static dependencies = {
    abilities: Abilities,
    enemies: EnemyInstances,
  };

  protected enemies !: Enemies;
  protected abilities !: Abilities;

  badFS: number = 0;
  justEnteredSE: boolean = false;
  checkDelay: number = 0;

  numCasts = {
    [SPELLS.STORM_ELEMENTAL_TALENT.id]: 0,
    [SPELLS.LIGHTNING_BOLT.id]: 0,
    [SPELLS.CHAIN_LIGHTNING.id]: 0,
    [SPELLS.EARTH_SHOCK.id]: 0,
    [SPELLS.EARTHQUAKE.id]: 0,
    others: 0,
  };

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STORM_ELEMENTAL_TALENT.id);
<<<<<<< HEAD:src/parser/shaman/elemental/modules/talents/StormElemental.tsx
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.STORM_ELEMENTAL_TALENT), this.onSECast);
=======
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
>>>>>>> upstream/shadowlands:src/parser/shaman/elemental/modules/talents/StormElemental.js
  }

  get stormEleUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.WIND_GUST_BUFF.id) / this.owner.fightDuration;
  }

  get averageLightningBoltCasts() {
    return (this.numCasts[SPELLS.LIGHTNING_BOLT.id]/this.numCasts[SPELLS.STORM_ELEMENTAL_TALENT.id]) || 0;
  }

  get averageChainLightningCasts() {
    return (this.numCasts[SPELLS.CHAIN_LIGHTNING.id]/this.numCasts[SPELLS.STORM_ELEMENTAL_TALENT.id]) || 0;
  }
  onSECast(event: CastEvent){
    this.justEnteredSE = true;
    this.numCasts[SPELLS.STORM_ELEMENTAL_TALENT.id]+=1;
  }

<<<<<<< HEAD:src/parser/shaman/elemental/modules/talents/StormElemental.tsx
  onCast(event: CastEvent) {
=======
  onCast(event) {
>>>>>>> upstream/shadowlands:src/parser/shaman/elemental/modules/talents/StormElemental.js
    const spellId = event.ability.guid;
    const target = this.enemies.getEntity(event);


    if(spellId === SPELLS.STORM_ELEMENTAL_TALENT.id) {
      this.justEnteredSE = true;
      this.numCasts[SPELLS.STORM_ELEMENTAL_TALENT.id]+=1;
    }

    const ability = this.abilities.getAbility(spellId);
    if(!ability){
      return;
    }

    if(!this.selectedCombatant.hasBuff(SPELLS.WIND_GUST_BUFF.id, event.timestamp)){
      return;
    }

    if(this.justEnteredSE){
      if(target){
        this.justEnteredSE = false;
        if(!target.hasBuff(SPELLS.FLAME_SHOCK.id, event.timestamp-this.checkDelay) || (target.getBuff(SPELLS.FLAME_SHOCK.id, event.timestamp-this.checkDelay)?.end || 0) - event.timestamp < STORMELE_DURATION){
          this.badFS+=1;
        }
      }
    }

    if (this.numCasts[spellId] !== undefined) {
      this.numCasts[spellId] += 1;
    } else {
      this.numCasts.others += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        tooltip={(
          <>
            With a uptime of: {formatPercentage(this.stormEleUptime)} %<br />
            Casts while Storm Elemental was up:
            <ul>
              <li>Earth Shock: {this.numCasts[SPELLS.EARTH_SHOCK.id]}</li>
              <li>Lightning Bolt: {this.numCasts[SPELLS.LIGHTNING_BOLT.id]}</li>
              <li>Earthquake: {this.numCasts[SPELLS.EARTHQUAKE.id]}</li>
              <li>Chain Lightning: {this.numCasts[SPELLS.CHAIN_LIGHTNING.id]}</li>
              <li>Other Spells: {this.numCasts.others}</li>
            </ul>
          </>
        )}
      >
        <>
          You cast <SpellLink id={SPELLS.LIGHTNING_BOLT.id} /> {this.averageLightningBoltCasts} times per <SpellLink id={SPELLS.STORM_ELEMENTAL_TALENT.id} />
        </>
      </Statistic>

    );
  }

  get suggestionThresholds() {
    return {
      actual: this.numCasts.others,
      isGreaterThan: {
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    const abilities = `Lightning Bolt/Chain Lightning and Earth Shock/Earthquake`;
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<span>Maximize your damage during Storm Elemental by only using {abilities}.</span>)
          .icon(SPELLS.STORM_ELEMENTAL_TALENT.icon)
          .actual(i18n._(t('shaman.elemental.suggestions.stormElemental.badCasts')`${actual} other casts with Storm Elemental up`))
          .recommended(`Only cast ${abilities} while Storm Elemental is up.`));
  }
}

export default StormElemental;
