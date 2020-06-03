import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber, formatPercentage } from 'common/format';
import ItemDamageDone from 'interface/ItemDamageDone';
import SpellLink from 'common/SpellLink';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { ApplyBuffEvent, ApplyBuffStackEvent, CastEvent, DamageEvent, EventType, RemoveBuffEvent } from 'parser/core/Events';

const MAX_STACKS: number = 5;

const MAX_TRAVEL_TIME = 700;

/**
 * Mongoose Fury increases Mongoose Bite damage by 15% for 14 sec, stacking up to 5 times. Successive
 * attacks do not increase duration.
 *
 * Example log: https://www.warcraftlogs.com/reports/CDL6mZfWdcgQX9wT#fight=2&type=damage-done&source=23
 */

class MongooseBite extends Analyzer {

  damage = 0;
  mongooseBiteStacks: number[] = [];
  lastMongooseBiteStack: number = 0;
  totalWindowsStarted = 0;
  fiveBiteWindows = 0;
  aspectOfTheEagleFixed = false;
  buffApplicationTimestamp: number = 0;
  accumulatedFocusAtWindow: any[] = [];
  focusAtMomentOfCast = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MONGOOSE_BITE_TALENT.id);
    this.mongooseBiteStacks = Array.from({ length: MAX_STACKS + 1 }, x => 0);
  }

  handleStacks(event: DamageEvent | ApplyBuffEvent | ApplyBuffStackEvent | RemoveBuffEvent) {
    if (event.type === EventType.RemoveBuff) {
      this.lastMongooseBiteStack = 0;
    }
    if (event.type === EventType.Damage) {
      // Because Aspect of the Eagle applies a traveltime to Mongoose Bite, it sometimes applies the buff before it hits, despite not increasing the damage.
      // This fixes that, ensuring we reduce by 1, and later increasing it by one.
      if (this.lastMongooseBiteStack === 1 && event.timestamp < this.buffApplicationTimestamp + MAX_TRAVEL_TIME) {
        this.lastMongooseBiteStack -= 1;
        this.aspectOfTheEagleFixed = true;
      }
      if (!this.mongooseBiteStacks[this.lastMongooseBiteStack]) {
        this.mongooseBiteStacks[this.lastMongooseBiteStack] = 1;
      } else {
        this.mongooseBiteStacks[this.lastMongooseBiteStack] += 1;
      }
      if (this.aspectOfTheEagleFixed) {
        this.lastMongooseBiteStack += 1;
        this.aspectOfTheEagleFixed = false;
      }
      this.damage += event.amount + (event.absorbed || 0);
    }
    if (event.type === EventType.ApplyBuff) {
      this.lastMongooseBiteStack = 1;
      this.accumulatedFocusAtWindow[this.totalWindowsStarted] = this.focusAtMomentOfCast;
      this.totalWindowsStarted += 1;
    }
    if (event.type === EventType.ApplyBuffStack) {
      this.lastMongooseBiteStack = event.stack;
      if (this.lastMongooseBiteStack === MAX_STACKS) {
        this.fiveBiteWindows += 1;
      }
    }
  }

  get mongooseBiteByStacks() {
    return this.mongooseBiteStacks;
  }

  get totalMongooseBites() {
    return this.mongooseBiteStacks.reduce((totalHits: number, stackHits: number) => totalHits + stackHits, 0);
  }

  get fiveStackMongooseBites() {
    return this.mongooseBiteStacks[MAX_STACKS];
  }

  get averageFocusOnMongooseWindowStart() {
    return formatNumber(this.accumulatedFocusAtWindow.reduce((a, b) => a + b, 0) / this.totalWindowsStarted);
  }

  get percentMaxStacksHit() {
    return this.mongooseBiteStacks[MAX_STACKS] / this.totalMongooseBites;
  }

  get focusOnMongooseWindowThreshold() {
    return {
      actual: this.averageFocusOnMongooseWindowStart,
      isLessThan: {
        minor: 65,
        average: 62,
        major: 60,
      },
      style: 'number',
    };
  }

  get mongoose5StackHitThreshold() {
    return {
      actual: this.percentMaxStacksHit,
      isLessThan: {
        minor: 0.30,
        average: 0.29,
        major: 0.28,
      },
      style: 'percentage',
    };
  }

  on_byPlayer_damage(event: DamageEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MONGOOSE_BITE_TALENT.id && spellId !== SPELLS.MONGOOSE_BITE_TALENT_AOTE.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_cast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MONGOOSE_BITE_TALENT.id) {
      return;
    }
    this.focusAtMomentOfCast = event.classResources ? event.classResources[0].amount : 0;

    // this is for the timeline highlighting
    if (event.meta === undefined) {
      event.meta = {
        isEnhancedCast: false,
        isInefficientCast: false,
        enhancedCastReason: '',
        inefficientCastReason: '',
      };
    }
    if (this.selectedCombatant.hasBuff(SPELLS.VIPERS_VENOM_BUFF.id)) {
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'Viper\'s Venom buff still active.';
    }
    if (this.lastMongooseBiteStack === 5 && this.selectedCombatant.hasBuff(SPELLS.MONGOOSE_FURY.id)) {
      event.meta.isEnhancedCast = true;
      event.meta.enhancedCastReason = 'Mongoose Bite at 5 stacks of Mongoose Fury';
    }
  }

  on_byPlayer_applybuff(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MONGOOSE_FURY.id) {
      return;
    }
    this.handleStacks(event);
    this.buffApplicationTimestamp = event.timestamp;
  }

  on_byPlayer_applybuffstack(event: ApplyBuffStackEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MONGOOSE_FURY.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_removebuff(event: RemoveBuffEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MONGOOSE_FURY.id) {
      return;
    }
    this.handleStacks(event);
  }
  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        tooltip={(
          <>
            You hit an average of {(this.mongooseBiteStacks[MAX_STACKS] / this.fiveBiteWindows).toFixed(1)} bites when you had {MAX_STACKS} stacks of Mongoose Fury. <br />
            You hit an average of {(this.totalMongooseBites / this.totalWindowsStarted).toFixed(1)} bites per Mongoose Fury window started.
          </>
        )}
        dropdown={(
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Stacks</th>
                  <th>Hits (total)</th>
                  <th>Hits (%)</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(this.mongooseBiteByStacks).map((e, i: string | number) => (
                  <tr key={i}>
                    <th>{i}</th>
                    <td>{e}</td>
                    <td>{formatPercentage(+e / this.totalMongooseBites)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.MONGOOSE_BITE_TALENT}>
          <ItemDamageDone amount={this.damage} /> <br />
          {this.fiveStackMongooseBites}/{this.totalMongooseBites} <small>5 stack bites</small>

        </BoringSpellValueText>
      </Statistic>
    );
  }

  suggestions(when: any) {
    when(this.focusOnMongooseWindowThreshold).addSuggestion((suggest: any, actual: any, recommended: any) => {
      return suggest(<>When talented into <SpellLink id={SPELLS.MONGOOSE_BITE_TALENT.id} />, it's important to have accumulated a good amount of focus before you open a <SpellLink id={SPELLS.MONGOOSE_FURY.id} /> window in order to maximize the number of <SpellLink id={SPELLS.MONGOOSE_BITE_TALENT.id} />s at high stacks.</>)
        .icon(SPELLS.MONGOOSE_BITE_TALENT.icon)
        .actual(`${formatNumber(actual)} average focus on new window.`)
        .recommended(`>${formatNumber(recommended)} is recommended`);
    });
    when(this.mongoose5StackHitThreshold).addSuggestion((suggest: any, actual: any, recommended: any) => {
      return suggest(<>It's important to cast as much <SpellLink id={SPELLS.MONGOOSE_BITE_TALENT.id} />s as possible when having max(5) stacks of <SpellLink id={SPELLS.MONGOOSE_FURY.id} />.</>)
        .icon(SPELLS.MONGOOSE_BITE_TALENT.icon)
        .actual(`${formatPercentage(actual)}% casts on max stacks.`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }
}

export default MongooseBite;
