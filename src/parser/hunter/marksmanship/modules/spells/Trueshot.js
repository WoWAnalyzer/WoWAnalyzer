import React from 'react';
import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS/hunter';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import ResourceIcon from 'common/ResourceIcon';
import Abilities from 'parser/core/modules/Abilities';
import SpellLink from 'common/SpellLink';

/**
 * Immediately gain 1 charge of Aimed Shot, and gain 30% Haste for 15 sec.
 * Lasts 15 sec.
 *
 * Example log: https://www.warcraftlogs.com/reports/v6nrtTxNKGDmYJXy#fight=16&type=auras&source=6
 */
class Trueshot extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  trueshotCasts = 0;
  accumulatedFocusAtTSCast = 0;
  aimedShotsPrTS = 0;
  wastedAimedShotCharges = 0;
  startFocusForCombatant = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.TRUESHOT.id && spellId !== SPELLS.AIMED_SHOT.id) {
      return;
    }
    if (spellId === SPELLS.TRUESHOT.id) {
      this.trueshotCasts += 1;
      this.accumulatedFocusAtTSCast += event.classResources[0].amount || 0;
    }
    if (spellId === SPELLS.AIMED_SHOT.id && this.selectedCombatant.hasBuff(SPELLS.TRUESHOT.id)) {
      this.aimedShotsPrTS++;
    }
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(16)}
        icon={<SpellIcon id={SPELLS.TRUESHOT.id} />}
        value={(
          <>
            {this.averageAimedShots}{' '}
            <SpellIcon
              id={SPELLS.AIMED_SHOT.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
            {'  '}
            {this.averageFocus}{' '}
            <ResourceIcon
              id={RESOURCE_TYPES.FOCUS.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
          </>
        )}
        label="Trueshot info"
        tooltip={`Information regarding your average Trueshot window:
        <ul>
          <li>You started your Trueshot windows with an average of ${this.averageFocus} focus.</li>
          <li>You hit an average of ${this.averageAimedShots} Aimed Shots inside each Trueshot window. </li>
          <li>You gained ${this.trueshotCasts - this.wastedAimedShotCharges} charges of Aimed Shot and lost out on ${this.wastedAimedShotCharges} charges by activating Trueshot whilst Aimed Shot wasn't on cooldown.</li>
        </ul>`}
      />
    );
  }

  get averageAimedShots() {
    return (this.aimedShotsPrTS / this.trueshotCasts).toFixed(1);
  }

  get averageFocus() {
    return formatNumber(this.accumulatedFocusAtTSCast / this.trueshotCasts);
  }

  get aimedShotThreshold() {
    return {
      actual: this.averageAimedShots,
      isLessThan: {
        minor: 3,
        average: 2.5,
        major: 2,
      },
      style: 'decimal',
    };
  }

  suggestions(when) {
    when(this.aimedShotThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          You only cast {actual} <SpellLink id={SPELLS.AIMED_SHOT.id} />s inside your average <SpellLink id={SPELLS.TRUESHOT.id} /> window. This is your only DPS cooldown, and it's important to maximize it to it's fullest potential by getting as many Aimed Shot squeezed in as possible.
        </>
      )
        .icon(SPELLS.TRUESHOT.icon)
        .actual(`Average of ${actual} Aimed Shots per Trueshot.`)
        .recommended(`>${recommended} is recommended`);
    });
  }
}

export default Trueshot;
