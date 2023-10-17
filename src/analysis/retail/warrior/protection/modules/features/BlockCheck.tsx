import { defineMessage } from '@lingui/macro';
import { formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import TALENTS from 'common/TALENTS/warrior';

import ShieldBlock from '../spells/ShieldBlock';

const debug = false;

//Moved from another file as it was easier to keep track of with this name
class BlockCheck extends Analyzer {
  static dependencies = {
    shieldBlock: ShieldBlock,
  };

  protected shieldBlock!: ShieldBlock;

  physicalHitsWithBlock = 0;
  physicalHitsWithoutBlock = 0;
  rawDamageWithBlock = 0;
  rawDamageWithoutBlock = 0;
  listOfEvents: BlockedEvent[] = [];
  bolster = false;
  major = 0;
  average = 0;
  minor = 0;

  constructor(options: Options) {
    super(options);
    this.bolster = this.selectedCombatant.hasTalent(TALENTS.BOLSTER_TALENT);
    const reprisal = false;
    const heavyRepercussions = this.selectedCombatant.hasTalent(TALENTS.HEAVY_REPERCUSSIONS_TALENT);

    if (this.bolster && reprisal) {
      this.minor = 0.8;
      this.average = 0.7;
      this.major = 0.6;
    } else if (heavyRepercussions && reprisal) {
      this.minor = 0.9;
      this.average = 0.8;
      this.major = 0.7;
    } else if (reprisal) {
      this.minor = 0.7;
      this.average = 0.6;
      this.major = 0.6;
    } else if (this.bolster) {
      this.minor = 0.7;
      this.average = 0.6;
      this.major = 0.5;
    } else if (heavyRepercussions) {
      this.minor = 0.7;
      this.average = 0.6;
      this.major = 0.5;
    } else {
      this.minor = 0.6;
      this.average = 0.5;
      this.major = 0.4;
    }

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onDamageTaken(event: DamageEvent) {
    // Physical
    if (event.ability.type === 1) {
      const sbBlock = this.selectedCombatant.hasBuff(SPELLS.SHIELD_BLOCK_BUFF.id);
      const bolsterBlock = this.bolster && this.selectedCombatant.hasBuff(SPELLS.LAST_STAND.id);
      this.listOfEvents.push({
        blocked: sbBlock || bolsterBlock,
        event: event,
      });
    }
  }

  onFightEnd() {
    const blockableSet = new Set(); //this is master list of all BLOCKED events in the fight
    blockableSet.add(1); //make it so if they never hit sb we still get data from the melees they take
    this.shieldBlock.shieldBlocksDefensive.forEach((block) =>
      block.eventSpellId.forEach(
        (blockedAbility) => blockableSet.add(blockedAbility), //just go through one set to another
      ),
    );

    this.listOfEvents.forEach((blockEvent) => {
      if (blockableSet.has(blockEvent.event.ability.guid)) {
        //if it ain't been blocked over the whole fight it prob aint blockable
        if (blockEvent.blocked) {
          //they got block up when it happened?
          this.physicalHitsWithBlock += 1;
          this.rawDamageWithBlock += blockEvent.event.unmitigatedAmount || 0;
        } else {
          this.physicalHitsWithoutBlock += 1;
          this.rawDamageWithoutBlock += blockEvent.event.unmitigatedAmount || 0;
        }
      }
    });

    if (debug) {
      console.log(`Hits with block spell up ${this.physicalHitsWithBlock}`);
      console.log(`Hits without block spell up ${this.physicalHitsWithoutBlock}`);
    }
  }

  get suggestionThresholds() {
    //was in here before but is/was never used and appears to be very high requirements that are unreasonable maybe lower and add laster?
    return {
      actual: this.rawDamageWithBlock / (this.rawDamageWithBlock + this.rawDamageWithoutBlock),
      isLessThan: {
        minor: this.minor,
        average: this.average,
        major: this.major,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You only had <SpellLink spell={SPELLS.SHIELD_BLOCK_BUFF} />{' '}
          {this.bolster && (
            <>
              or <SpellLink spell={SPELLS.LAST_STAND} />
            </>
          )}{' '}
          for {formatPercentage(actual)}% of physical damage taken. You should have one of the two
          up to mitigate as much physical damage as possible.
        </>,
      )
        .icon(SPELLS.SHIELD_BLOCK_BUFF.icon)
        .actual(
          defineMessage({
            id: 'warrior.protection.suggestions.block.damageMitigated',
            message: `${formatPercentage(actual)}% was mitigated by a block spell`,
          }),
        )
        .recommended(
          `${formatPercentage(
            recommended,
          )}% or more is recommended but this may vary between fights`,
        ),
    );
  }

  statistic() {
    const physicalHitsMitigatedPercent =
      this.physicalHitsWithBlock / (this.physicalHitsWithBlock + this.physicalHitsWithoutBlock);

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(25)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={this.baseTooltip}
      >
        <BoringValueText
          label={
            <>
              <SpellIcon spell={SPELLS.SHIELD_BLOCK_BUFF} /> Physical Hits Mitigated
            </>
          }
        >
          {formatPercentage(physicalHitsMitigatedPercent)}%
        </BoringValueText>
      </Statistic>
    );
  }

  /** The tooltip in the base form of this statistic */
  get baseTooltip(): React.ReactNode {
    const physicalHitsMitigatedPercent =
      this.physicalHitsWithBlock / (this.physicalHitsWithBlock + this.physicalHitsWithoutBlock);
    const physicalDamageMitigatedPercent =
      this.rawDamageWithBlock / (this.rawDamageWithBlock + this.rawDamageWithoutBlock);
    return (
      <>
        Shield Block usage breakdown:
        <ul>
          <li>
            You were hit <strong>{this.physicalHitsWithBlock}</strong> times with block up (
            <strong>{formatThousands(this.rawDamageWithBlock)}</strong> damage).
          </li>
          <li>
            You were hit <strong>{this.physicalHitsWithoutBlock}</strong> times{' '}
            <strong>
              <em>without</em>
            </strong>{' '}
            block up (<strong>{formatThousands(this.rawDamageWithoutBlock)}</strong> damage).
          </li>
        </ul>
        <strong>{formatPercentage(physicalHitsMitigatedPercent)}%</strong> of physical attacks were
        mitigated with Block (<strong>{formatPercentage(physicalDamageMitigatedPercent)}%</strong>{' '}
        of physical damage taken).
      </>
    );
  }
}

type BlockedEvent = {
  blocked: boolean;
  event: DamageEvent;
};

export default BlockCheck;
