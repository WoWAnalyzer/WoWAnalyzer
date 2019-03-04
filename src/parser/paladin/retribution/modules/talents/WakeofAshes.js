import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

// the application of the damage is instant after the cast, but seems to have a little bit of leeway across multiple enemies
// this example log: /report/FaYGNxBzDVKAR8Lp/11-Mythic+Grong+-+Kill+(5:47)/Ilivath shows around +15ms, so setting 100ms buffer to account for lag

class WakeofAshes extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  totalHits = 0;
  badCasts = 0;
  wakeCast = false;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.WAKE_OF_ASHES_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.WAKE_OF_ASHES_TALENT.id) {
      return;
    }
    this.totalHits += 1;
    this.wakeCast = false;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.WAKE_OF_ASHES_TALENT.id) {
      return;
    }
    if (this.wakeCast) {
      this.badCasts += 1;
    }
    this.wakeCast = true;
  }

  on_fightend() {
    if (this.wakeCast) {
      this.badCasts += 1;
    }
  }

  get averageHitPerCast() {
    return this.totalHits / this.abilityTracker.getAbility(SPELLS.WAKE_OF_ASHES_TALENT.id).casts;
  }

  get badCastsThresholds() {
    return {
      actual: this.badCasts,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 0,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.badCastsThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<><SpellLink id={SPELLS.WAKE_OF_ASHES_TALENT.id} /> hit 0 targets {(this.badCasts)} time(s). <SpellLink id={SPELLS.BLADE_OF_JUSTICE.id} /> has the same range of 12yds. You can use this as a guideline to tell if targets will be in range.</>)
          .icon(SPELLS.WAKE_OF_ASHES_TALENT.icon)
          .actual(`${(this.badCasts)} casts with no targets hit.`)
          .recommended(`${(recommended)} is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.UNIMPORTANT()}
        icon={<SpellIcon id={SPELLS.WAKE_OF_ASHES_TALENT.id} />}
        value={(
          <>
            {(this.averageHitPerCast.toFixed(2))} Average<br />
            {`${this.badCasts > 0 ? `${this.badCasts} Missed` : ''} `}
          </>
        )}
        label="Targets Hit"
        tooltip={`You averaged ${(this.averageHitPerCast.toFixed(2))} hits per cast of Wake of Ashes. ${this.badCasts > 0 ? `Additionally, you cast Wake of Ashes ${this.badCasts} time(s) without hitting anything.` : ''}`}
      />
    );
  }
}

export default WakeofAshes;