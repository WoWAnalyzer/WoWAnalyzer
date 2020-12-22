import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import EnemyInstances from 'parser/shared/modules/EnemyInstances';

import Abilities from 'parser/shaman/elemental/modules/Abilities';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import Statistic from 'interface/statistics/Statistic';
import SpellLink from 'common/SpellLink';

import { t } from '@lingui/macro';

class StormElemental extends Analyzer {

  static dependencies = {
    abilities: Abilities,
    enemies: EnemyInstances,
  };
  badFS = 0;
  justEnteredSE = false;
  checkDelay = 0;
  numCasts: Record<number, number> & {others: number} = {
    [SPELLS.STORM_ELEMENTAL_TALENT.id]: 0,
    [SPELLS.LIGHTNING_BOLT.id]: 0,
    [SPELLS.CHAIN_LIGHTNING.id]: 0,
    [SPELLS.EARTH_SHOCK.id]: 0,
    [SPELLS.EARTHQUAKE.id]: 0,
    others: 0,
  };
  protected enemies !: Enemies;
  protected abilities !: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STORM_ELEMENTAL_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.STORM_ELEMENTAL_TALENT), this.onSECast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onSECast);
  }

  get stormEleUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.WIND_GUST_BUFF.id) / this.owner.fightDuration;
  }

  get averageLightningBoltCasts() {
    return (this.numCasts[SPELLS.LIGHTNING_BOLT.id] / this.numCasts[SPELLS.STORM_ELEMENTAL_TALENT.id]) || 0;
  }

  get averageChainLightningCasts() {
    return (this.numCasts[SPELLS.CHAIN_LIGHTNING.id] / this.numCasts[SPELLS.STORM_ELEMENTAL_TALENT.id]) || 0;
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

  onSECast(event: CastEvent) {
    this.justEnteredSE = true;
    this.numCasts[SPELLS.STORM_ELEMENTAL_TALENT.id] += 1;
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;

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

  suggestions(when: When) {
    const abilities = `Lightning Bolt/Chain Lightning and Earth Shock/Earthquake`;
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<span>Maximize your damage during Storm Elemental by only using {abilities}.</span>)
        .icon(SPELLS.STORM_ELEMENTAL_TALENT.icon)
        .actual(t({
      id: "shaman.elemental.suggestions.stormElemental.badCasts",
      message: `${actual} other casts with Storm Elemental up`
    }))
        .recommended(`Only cast ${abilities} while Storm Elemental is up.`));
  }
}

export default StormElemental;
