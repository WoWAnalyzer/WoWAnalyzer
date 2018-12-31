import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import AverageTargetsHit from 'interface/others/AverageTargetsHit';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import SpellLink from 'common/SpellLink';

/**
 * Rapidly fires a spray of shots for 3 sec, dealing an average of (80% * 10) Physical damage to all enemies in front of you.
 * Usable while moving.
 *
 * Example log: https://www.warcraftlogs.com/reports/mzZMhjAFVadHLYBT#fight=7&type=damage-done&source=22
 */

const BARRAGE_HITS_PER_CAST = 10;

class Barrage extends Analyzer {

  damage = 0;
  casts = [];
  hits = 0;
  uniqueTargets = [];
  uniqueTargetsHit = 0;
  inefficientCasts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BARRAGE_TALENT.id);
  }

  get currentCast() {
    if (this.casts.length === 0) {
      return null;
    }

    return this.casts[this.casts.length - 1];
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BARRAGE_TALENT.id) {
      return;
    }
    this.casts.push({ hits: 0 });
    this.uniqueTargets = [];
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BARRAGE_DAMAGE.id) {
      return;
    }
    const damageTarget = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.uniqueTargets.includes(damageTarget)) {
      this.uniqueTargetsHit += 1;
      this.uniqueTargets.push(damageTarget);
    }
    const damage = event.amount + (event.absorbed || 0);
    if (this.currentCast !== null) {
      this.currentCast.hits += 1;
    }
    this.hits += 1;
    this.damage += damage;
  }

  on_fightend() {
    this.casts.forEach((cast) => {
      cast.averageHits = cast.hits / BARRAGE_HITS_PER_CAST;
      if (cast.averageHits < 1) {
        this.inefficientCasts += 1;
      }
    });
  }

  get barrageInefficientCastsThreshold() {
    return {
      actual: this.inefficientCasts,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 1,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.barrageInefficientCastsThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>You cast <SpellLink id={SPELLS.BARRAGE_TALENT.id} /> inefficiently {actual} {actual > 1 ? 'times' : 'time'} throughout the fight. This means you didn't hit all {BARRAGE_HITS_PER_CAST} shots of your barrage channel. Remember to always be facing your target when channelling <SpellLink id={SPELLS.BARRAGE_TALENT.id} />. </>)
        .icon(SPELLS.BARRAGE_TALENT.icon)
        .actual(`${actual} inefficient ${actual > 1 ? 'casts' : 'cast'}`)
        .recommended(`${recommended} is recommended`);
    });
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.BARRAGE_TALENT.id}
        value={<>
          <ItemDamageDone amount={this.damage} /> <br />
          <AverageTargetsHit casts={this.casts.length} hits={this.hits} /> <br />
          <AverageTargetsHit casts={this.casts.length} hits={this.uniqueTargetsHit} unique approximate />
        </>}
      />
    );
  }

}

export default Barrage;
