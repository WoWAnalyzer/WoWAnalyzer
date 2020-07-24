import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatNumber, formatPercentage } from 'common/format';
import ItemDamageDone from 'interface/ItemDamageDone';
import SpellLink from 'common/SpellLink';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, CastEvent, DamageEvent, EventType, RemoveBuffEvent } from 'parser/core/Events';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { RAPTOR_MONGOOSE_VARIANTS } from 'parser/hunter/survival/constants';

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
  accumulatedFocusAtMomentOfCast = 0;
  windowCheckedForFocus: boolean = false;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MONGOOSE_BITE_TALENT.id);
    this.mongooseBiteStacks = Array.from({ length: MAX_STACKS + 1 }, x => 0);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(RAPTOR_MONGOOSE_VARIANTS), this.handleDamage);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(RAPTOR_MONGOOSE_VARIANTS), this.onCast);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MONGOOSE_FURY), (event: ApplyBuffEvent) => this.handleStacks(event));
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.MONGOOSE_FURY), (event: ApplyBuffStackEvent) => this.handleStacks(event));
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.MONGOOSE_FURY), (event: RemoveBuffEvent) => this.handleStacks(event));
  }

  handleDamage(event: DamageEvent) {
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

  handleStacks(event: ApplyBuffEvent | ApplyBuffStackEvent | RemoveBuffEvent) {
    this.lastMongooseBiteStack = currentStacks(event);
    if (this.lastMongooseBiteStack === MAX_STACKS) {
      this.fiveBiteWindows += 1;
    }
    if (event.type === EventType.ApplyBuff) {
      this.buffApplicationTimestamp = event.timestamp;
      this.totalWindowsStarted += 1;
    }
    if (event.type === EventType.RemoveBuff) {
      this.windowCheckedForFocus = false;
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
    return this.accumulatedFocusAtMomentOfCast / this.totalWindowsStarted;
  }

  get percentMaxStacksHit() {
    return this.mongooseBiteStacks[MAX_STACKS] / this.totalMongooseBites;
  }

  get focusOnMongooseWindowThreshold() {
    return {
      actual: formatNumber(this.averageFocusOnMongooseWindowStart),
      isLessThan: {
        minor: 65,
        average: 60,
        major: 55,
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

  onCast(event: CastEvent) {
    if (!this.windowCheckedForFocus) {
      const resource = event.classResources?.find(resource => resource.type === RESOURCE_TYPES.FOCUS.id);
      if (resource) {
        this.accumulatedFocusAtMomentOfCast += resource.amount || 0;
      }
      this.windowCheckedForFocus = true;
    }
    if (event.meta === undefined) {
      event.meta = {
        isEnhancedCast: false,
        enhancedCastReason: '',
      };
    }
    if (this.lastMongooseBiteStack === 5 && this.selectedCombatant.hasBuff(SPELLS.MONGOOSE_FURY.id)) {
      event.meta.isEnhancedCast = true;
      event.meta.enhancedCastReason = 'Mongoose Bite at 5 stacks of Mongoose Fury';
    }
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
