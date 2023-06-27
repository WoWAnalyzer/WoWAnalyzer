import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import TALENTS from 'common/TALENTS/warrior';

const debug = false;

class ShieldBlock extends Analyzer {
  shieldBlocksOffensive: OffensiveData[] = [];
  shieldBlocksDefensive: DefensiveData[] = [];
  shieldBlocksOverall: OverallData[] = [];
  goodCast = 0;
  badCast = 0;
  bolster = this.selectedCombatant.hasTalent(TALENTS.BOLSTER_TALENT);
  ssNeeded = !this.selectedCombatant.hasTalent(TALENTS.DEVASTATOR_TALENT) ? 0 : 1;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_BLOCK), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
    this.addEventListener(Events.fightend, this.onFightend);
  }

  onCast(event: CastEvent) {
    if (this.shieldBlocksDefensive.length > 0) {
      this.checkLastBlock();
    }

    this.shieldBlockCast(event);
  }

  onDamage(event: DamageEvent) {
    const spellId = event.ability.guid;

    if (!this.selectedCombatant.hasBuff(SPELLS.SHIELD_BLOCK_BUFF.id)) {
      return;
    }

    if (this.shieldBlocksDefensive.length === 0) {
      // If we don't have shieldblock detected, meaning its pre casted, just ignore till we get one
      return;
    }

    if (spellId === SPELLS.SHIELD_SLAM.id) {
      this.shieldSlamCast(event);
    }
  }

  onDamageTaken(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.SHIELD_BLOCK_BUFF.id)) {
      return;
    }

    if (this.selectedCombatant.hasBuff(SPELLS.LAST_STAND.id) && this.bolster) {
      return;
    }

    if (this.shieldBlocksDefensive.length === 0) {
      // If we don't have shieldblock detected, meaning its pre casted, just ignore till we get one
      return;
    }

    if ((event.blocked || 0) > 0) {
      this.shieldBlocksDefensive[this.shieldBlocksDefensive.length - 1].blockAbleEvents += 1;
      this.shieldBlocksDefensive[this.shieldBlocksDefensive.length - 1].eventName.add(
        event.ability.name,
      );
      this.shieldBlocksDefensive[this.shieldBlocksDefensive.length - 1].eventSpellId.add(
        event.ability.guid,
      );
    }

    this.shieldBlocksDefensive[this.shieldBlocksDefensive.length - 1].blockedDamage +=
      event.blocked || 0;
    this.shieldBlocksDefensive[this.shieldBlocksDefensive.length - 1].damageTaken +=
      event.amount + (event.absorbed || 0);

    if (this.shieldBlocksDefensive[this.shieldBlocksDefensive.length - 1].blockAbleEvents > 1) {
      this.shieldBlocksDefensive[this.shieldBlocksDefensive.length - 1].good = true;
    }
  }

  shieldBlockCast(event: CastEvent) {
    const offensive = {
      shieldBlock: this.shieldBlocksOffensive.length + 1,
      shieldSlamCasts: 0,
      bonusDamage: 0,
      timeStamp: event.timestamp,
      good: false,
      event: event,
    };

    this.shieldBlocksOffensive.push(offensive);

    const defensive = {
      shieldBlock: this.shieldBlocksDefensive.length + 1,
      blockAbleEvents: 0,
      blockedDamage: 0,
      damageTaken: 0,
      eventName: new Set<string>(), //human readable
      eventSpellId: new Set<number>(), //data safe
      good: false,
    };

    this.shieldBlocksDefensive.push(defensive);
  }

  shieldSlamCast(event: DamageEvent) {
    this.shieldBlocksOffensive[this.shieldBlocksOffensive.length - 1].shieldSlamCasts += 1;

    if (
      this.shieldBlocksOffensive[this.shieldBlocksOffensive.length - 1].shieldSlamCasts >
      this.ssNeeded
    ) {
      this.shieldBlocksOffensive[this.shieldBlocksOffensive.length - 1].good = true;
    }

    const beforeDamage =
      this.shieldBlocksOffensive[this.shieldBlocksOffensive.length - 1].bonusDamage || 0;
    const eventDamage = (event.amount || 0) + (event.absorbed || 0);
    const bonusDamage = Math.round(eventDamage - eventDamage / 1.3);

    this.shieldBlocksOffensive[this.shieldBlocksOffensive.length - 1].bonusDamage =
      beforeDamage + bonusDamage;
  }

  checkLastBlock() {
    const overall = {
      shieldBlock: this.shieldBlocksOffensive[this.shieldBlocksOffensive.length - 1].shieldBlock,
      good:
        this.shieldBlocksOffensive[this.shieldBlocksOffensive.length - 1].good ||
        this.shieldBlocksDefensive[this.shieldBlocksDefensive.length - 1].good,
    };

    if (overall.good) {
      this.goodCast += 1;
    } else {
      this.badCast += 1;
      const event = this.shieldBlocksOffensive[this.shieldBlocksOffensive.length - 1].event;
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `This Shield Block didn't block enough damage nor did you cast enough Shield Slams.`;
      this.shieldBlocksOffensive[this.shieldBlocksOffensive.length - 1].event = event;
    }

    this.shieldBlocksOverall.push(overall);
  }

  onFightend() {
    if (this.shieldBlocksDefensive.length > 0) {
      this.checkLastBlock();
    }

    if (debug) {
      console.log(this.shieldBlocksOffensive);
      console.log(`Do they have bolster? ${this.bolster}`);
      console.log(this.shieldBlocksDefensive);
      console.log(this.shieldBlocksOverall);
    }
  }

  get suggestionThresholds() {
    return {
      actual: this.goodCast / (this.goodCast + this.badCast),
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          {' '}
          You had uneventful <SpellLink id={SPELLS.SHIELD_BLOCK.id} /> cast(s) where there was
          either no blockable damage events or you didn't cast shield slam enough.{' '}
        </>,
      )
        .icon(SPELLS.SHIELD_BLOCK.icon)
        .actual(`${this.goodCast} good casts of shield block`)
        .recommended(`${Math.floor(recommended * (this.goodCast + this.badCast))} is recommended`),
    );
  }

  statistic() {
    let goodCasts = 0;
    let offensiveCasts = 0;
    let defensiveCasts = 0;
    const totalCasts = this.shieldBlocksOverall.length;
    for (let i = 0; i < this.shieldBlocksOverall.length; i += 1) {
      goodCasts += this.shieldBlocksOverall[i].good ? 1 : 0;
      offensiveCasts += this.shieldBlocksOffensive[i].good ? 1 : 0;
      defensiveCasts += this.shieldBlocksDefensive[i].good ? 1 : 0;
    }

    return (
      <Statistic
        size="flexible"
        tooltip={
          <>
            Overall bad casts: {totalCasts - goodCasts}
            <br />
            Good offensive casts: {offensiveCasts}
            <br />
            Good offensive casts where you cast <SpellLink id={SPELLS.SHIELD_SLAM.id} /> during the{' '}
            <SpellLink id={SPELLS.SHIELD_BLOCK.id} /> buff to take advantage of increased{' '}
            <SpellLink id={SPELLS.SHIELD_SLAM.id} /> damage.
            <br />
            <br />
            Good defensive casts: {defensiveCasts}
            <br />
            Good defensive casts where you blocked several hits.
            <br />
            <br />
            Some casts may be good both offensively and defensively.
            <br />
            <br />
            Try to maximize the efficiency of your <SpellLink id={SPELLS.SHIELD_BLOCK.id} /> casts
            by ensuring that you take advantage of the offensive or defensive effects each time.
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellIcon id={SPELLS.SHIELD_BLOCK.id} /> Bad Defensive Casts
            </>
          }
        >
          {totalCasts - defensiveCasts}{' '}
          <small>({formatPercentage(1 - defensiveCasts / totalCasts)}%)</small>
          <br />
        </BoringValueText>
      </Statistic>
    );
  }
}

type OffensiveData = {
  shieldBlock: number;
  shieldSlamCasts: number;
  bonusDamage: number;
  timeStamp: number;
  good: boolean;
  event: CastEvent;
};

type DefensiveData = {
  shieldBlock: number;
  blockAbleEvents: number;
  blockedDamage: number;
  damageTaken: number;
  eventName: Set<string>;
  eventSpellId: Set<number>;
  good: boolean;
};

type OverallData = {
  shieldBlock: number;
  good: boolean;
};

export default ShieldBlock;
