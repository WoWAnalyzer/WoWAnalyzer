import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer, { Options } from 'parser/core/Analyzer';
import EnemyInstances from 'parser/shared/modules/EnemyInstances';

import { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import Abilities from 'parser/shaman/elemental/modules/Abilities';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { CastEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

const ASCENDANCE_DURATION = 15000 - 1500; //remove the gcd for Ascendence itself because we only check for FS on the first cast after

class Ascendance extends Analyzer {

  static dependencies = {
    abilities: Abilities,
    enemies: EnemyInstances,
  };

  protected abilities!: Abilities;
  protected enemies!: Enemies;

  justEnteredAscendance: boolean = false;
  badFSAscendence: number = 0;
  checkDelay: number = 0;

  numCasts = {
    [SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id]: 0,
    [SPELLS.LAVA_BURST.id]: 0,
    [SPELLS.EARTH_SHOCK.id]: 0,
    [SPELLS.ELEMENTAL_BLAST_TALENT.id]: 0,
    others: 0,
  };

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id);
  }

  get AscendanceUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id) / this.owner.fightDuration;
  }

  get averageLavaBurstCasts() {
    return (this.numCasts[SPELLS.LAVA_BURST.id] / this.numCasts[SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id]) || 0;
  }

  on_byPlayer_cast(event: CastEvent) {
    const spellId = event.ability.guid;
    const target = this.enemies.getEntity(event);

    if (spellId === SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id) {
      this.justEnteredAscendance = true;
      this.numCasts[SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id] += 1;
    }

    const ability = this.abilities.getAbility(spellId);
    if (!ability) {
      return;
    }

    if (!this.selectedCombatant.hasBuff(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id, event.timestamp) || spellId === SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id) {
      return;
    }

    if (this.justEnteredAscendance) {
      if (target) {
        this.justEnteredAscendance = false;
        if (!target.hasBuff(SPELLS.FLAME_SHOCK.id, event.timestamp - this.checkDelay) ||
          (target.getBuff(SPELLS.FLAME_SHOCK.id, event.timestamp - this.checkDelay)?.end || 0 - event.timestamp) < ASCENDANCE_DURATION) {
          this.badFSAscendence += 1;
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
    const hasEB = this.selectedCombatant.hasTalent(SPELLS.ELEMENTAL_BLAST_TALENT.id);

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
            With a uptime of: {formatPercentage(this.AscendanceUptime)} %<br />
            Casts while Ascendance was up:
            <ul>
              <li>Earth Shock: {this.numCasts[SPELLS.EARTH_SHOCK.id]}</li>
              <li>Lava Burst: {this.numCasts[SPELLS.LAVA_BURST.id]}</li>
              {hasEB && <li>Elemental Blast: {this.numCasts[SPELLS.ELEMENTAL_BLAST_TALENT.id]}</li>}
              <li>Other Spells: {this.numCasts.others}</li>
            </ul>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.ASCENDANCE_TALENT_ELEMENTAL}>
          <>
            On average {formatNumber(this.averageLavaBurstCasts)} Lava Bursts cast during Ascendance.
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.numCasts.others,
      isGreaterThan: {
        major: 0,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    const abilities = `Lava Burst ${this.selectedCombatant.hasTalent(SPELLS.ELEMENTAL_BLAST_TALENT.id) ? `, Elemental Blast ` : ``} and Earth Shock`;
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(<span>Maximize your damage during ascendance by only using ${abilities}.</span>)
        .icon(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.icon)
        .actual(`${actual} other casts during Ascendence`)
        .recommended(`Only cast ${abilities} during Ascendence.`));
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default Ascendance;
