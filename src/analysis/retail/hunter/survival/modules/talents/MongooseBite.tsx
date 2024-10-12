import { defineMessage } from '@lingui/macro';
import {
  MONGOOSE_BITE_MAX_STACKS,
  MONGOOSE_BITE_MAX_TRAVEL_TIME,
  RAPTOR_MONGOOSE_VARIANTS,
} from 'analysis/retail/hunter/survival/constants';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  DamageEvent,
  EventType,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { addEnhancedCastReason } from 'parser/core/EventMetaLib';

/**
 * Mongoose Fury increases Mongoose Bite damage by 15% for 14 sec, stacking up to 5 times. Successive attacks do not increase duration.
 *
 * Example log: https://www.warcraftlogs.com/reports/CDL6mZfWdcgQX9wT#fight=2&type=damage-done&source=23
 */

class MongooseBite extends Analyzer {
  private damage: number = 0;
  private mongooseBiteStacks: number[] = [];
  private lastMongooseBiteStack: number = 0;
  private totalWindowsStarted: number = 0;
  private fiveBiteWindows: number = 0;
  private aspectOfTheEagleFixed: boolean = false;
  private buffApplicationTimestamp: number = 0;
  private accumulatedFocusAtMomentOfCast: number = 0;
  private windowCheckedForFocus: boolean = false;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.MONGOOSE_BITE_TALENT);
    if (!this.active) {
      return;
    }

    this.mongooseBiteStacks = Array.from({ length: MONGOOSE_BITE_MAX_STACKS + 1 }, (x) => 0);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(RAPTOR_MONGOOSE_VARIANTS),
      this.handleDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(RAPTOR_MONGOOSE_VARIANTS),
      this.onCast,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MONGOOSE_FURY),
      this.handleStacks,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.MONGOOSE_FURY),
      this.handleStacks,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.MONGOOSE_FURY),
      this.handleStacks,
    );
  }

  get mongooseBiteByStacks() {
    return this.mongooseBiteStacks;
  }

  get totalMongooseBites() {
    return this.mongooseBiteStacks.reduce(
      (totalHits: number, stackHits: number) => totalHits + stackHits,
      0,
    );
  }

  get fiveStackMongooseBites() {
    return this.mongooseBiteStacks[MONGOOSE_BITE_MAX_STACKS];
  }

  get averageFocusOnMongooseWindowStart() {
    return this.accumulatedFocusAtMomentOfCast / this.totalWindowsStarted;
  }

  get percentMaxStacksHit() {
    return this.mongooseBiteStacks[MONGOOSE_BITE_MAX_STACKS] / this.totalMongooseBites;
  }

  get focusOnMongooseWindowThreshold() {
    return {
      actual: this.averageFocusOnMongooseWindowStart,
      isLessThan: {
        minor: 65,
        average: 60,
        major: 55,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get mongoose5StackHitThreshold() {
    return {
      actual: this.percentMaxStacksHit,
      isLessThan: {
        minor: 0.3,
        average: 0.29,
        major: 0.28,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  handleDamage(event: DamageEvent) {
    // Because Aspect of the Eagle applies a traveltime to Mongoose Bite, it sometimes applies the buff before it hits, despite not increasing the damage.
    // This fixes that, ensuring we reduce by 1, and later increasing it by one.
    if (
      this.lastMongooseBiteStack === 1 &&
      event.timestamp < this.buffApplicationTimestamp + MONGOOSE_BITE_MAX_TRAVEL_TIME
    ) {
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
    if (this.lastMongooseBiteStack === MONGOOSE_BITE_MAX_STACKS) {
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

  onCast(event: CastEvent) {
    if (!this.windowCheckedForFocus) {
      const resource = event.classResources?.find(
        (resource) => resource.type === RESOURCE_TYPES.FOCUS.id,
      );
      if (resource) {
        this.accumulatedFocusAtMomentOfCast += resource.amount || 0;
      }
      this.windowCheckedForFocus = true;
    }
    if (
      this.lastMongooseBiteStack === 5 &&
      this.selectedCombatant.hasBuff(SPELLS.MONGOOSE_FURY.id)
    ) {
      addEnhancedCastReason(event, 'Mongoose Bite at 5 stacks of Mongoose Fury');
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        tooltip={
          <>
            You hit an average of{' '}
            {(this.mongooseBiteStacks[MONGOOSE_BITE_MAX_STACKS] / this.fiveBiteWindows).toFixed(1)}{' '}
            bites when you had {MONGOOSE_BITE_MAX_STACKS} stacks of Mongoose Fury. <br />
            You hit an average of {(this.totalMongooseBites / this.totalWindowsStarted).toFixed(
              1,
            )}{' '}
            bites per Mongoose Fury window started.
          </>
        }
        dropdown={
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
                    <td>{formatPercentage(Number(e) / this.totalMongooseBites)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.MONGOOSE_BITE_TALENT}>
          <ItemDamageDone amount={this.damage} /> <br />
          {this.fiveStackMongooseBites}/{this.totalMongooseBites} <small>5 stack bites</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  suggestions(when: When) {
    when(this.focusOnMongooseWindowThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          When talented into <SpellLink spell={TALENTS.MONGOOSE_BITE_TALENT} />, it's important to
          have accumulated a good amount of focus before you open a{' '}
          <SpellLink spell={SPELLS.MONGOOSE_FURY} /> window in order to maximize the number of{' '}
          <SpellLink spell={TALENTS.MONGOOSE_BITE_TALENT} />s at high stacks.
        </>,
      )
        .icon(TALENTS.MONGOOSE_BITE_TALENT.icon)
        .actual(
          defineMessage({
            id: 'hunter.survival.suggestions.mongooseBite.focusWindow',
            message: `${formatNumber(actual)} average focus on new window.`,
          }),
        )
        .recommended(`>${formatNumber(recommended)} is recommended`),
    );
    when(this.mongoose5StackHitThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          It's important to cast as much <SpellLink spell={TALENTS.MONGOOSE_BITE_TALENT} />s as
          possible when having max(5) stacks of <SpellLink spell={SPELLS.MONGOOSE_FURY} />.
        </>,
      )
        .icon(TALENTS.MONGOOSE_BITE_TALENT.icon)
        .actual(
          defineMessage({
            id: 'hunter.survival.suggetsions.mongooseBite.maxStacksCasts',
            message: `${formatPercentage(actual)}% casts on max stacks.`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default MongooseBite;
