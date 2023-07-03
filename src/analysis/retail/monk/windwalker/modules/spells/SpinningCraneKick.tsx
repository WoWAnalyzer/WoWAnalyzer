import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { ApplyDebuffEvent, CastEvent, DamageEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { TALENTS_MONK } from 'common/TALENTS';

const MARK_OF_THE_CRANE_DURATION = 20000;
const MOD_PER_STACK = 0.18;
const MAX_STACKS = 5;
const MARKING_SPELLS = [
  SPELLS.TIGER_PALM,
  SPELLS.BLACKOUT_KICK,
  TALENTS_MONK.RISING_SUN_KICK_TALENT,
];

interface MarkOfTheCrane {
  target: MarkOfTheCraneTarget;
  timestamp: number;
}

interface MarkOfTheCraneTarget {
  id: number;
  instance: number;
}

const isEqual = (a: MarkOfTheCraneTarget, b: MarkOfTheCraneTarget) =>
  a.id === b.id && a.instance === b.instance;

class SpinningCraneKick extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    statTracker: StatTracker,
  };

  protected abilityTracker!: AbilityTracker;
  protected statTracker!: StatTracker;

  constructor(options: Options) {
    super(options);
    this.stackHistory = Array.from({ length: MAX_STACKS + 1 }, (x) => 0);
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER | SELECTED_PLAYER_PET).spell(SPELLS.MARK_OF_THE_CRANE),
      this.onMarkApplication,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER | SELECTED_PLAYER_PET).spell(MARKING_SPELLS),
      this.onMarkingSpell,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SPINNING_CRANE_KICK),
      this.onSCKCast,
    );
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER | SELECTED_PLAYER_PET)
        .spell(SPELLS.SPINNING_CRANE_KICK_DAMAGE),
      this.onSCKDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SPINNING_CRANE_KICK_DAMAGE),
      this.onPlayerSCKDamage,
    );
  }

  cycloneStrikesMarks: MarkOfTheCrane[] = [];
  totalDamage = 0;
  spinningCraneKickHits = 0;
  stackHistory: number[] = [];

  // targetInstance is undefined when it's the first one.
  _verifyTargetInstance(targetInstance: number | undefined) {
    return targetInstance === undefined ? 1 : targetInstance;
  }

  _verifyCurrentStacks(stacks: number) {
    return stacks <= MAX_STACKS ? stacks : MAX_STACKS;
  }

  onMarkApplication(event: ApplyDebuffEvent) {
    const targetInstance = this._verifyTargetInstance(event.targetInstance);
    const markOfTheCrane: MarkOfTheCrane = {
      target: { id: event.targetID, instance: targetInstance },
      timestamp: event.timestamp,
    };
    this.cycloneStrikesMarks.push(markOfTheCrane);
  }

  onMarkingSpell(event: CastEvent) {
    const targetInstance = this._verifyTargetInstance(event.targetInstance);
    const refreshedMark: MarkOfTheCrane = {
      // the spells used here should never be lacking a target, but if they somehow do, a targetID of -1 should never match any previous marks
      target: { id: event.targetID || -1, instance: targetInstance },
      timestamp: event.timestamp,
    };
    this.cycloneStrikesMarks.forEach((mark) => {
      if (isEqual(mark.target, refreshedMark.target)) {
        mark.timestamp = refreshedMark.timestamp;
      }
    });
  }

  onSCKCast(event: CastEvent) {
    // Filter out expired targets
    this.cycloneStrikesMarks = this.cycloneStrikesMarks.filter(
      (mark) => event.timestamp - mark.timestamp <= MARK_OF_THE_CRANE_DURATION,
    );
    this.stackHistory[this._verifyCurrentStacks(this.cycloneStrikesMarks.length)] += 1;
  }

  onSCKDamage(event: DamageEvent) {
    const mod = this._verifyCurrentStacks(this.cycloneStrikesMarks.length) * MOD_PER_STACK;
    const increase = calculateEffectiveDamage(event, mod);
    this.totalDamage += increase;
  }

  onPlayerSCKDamage() {
    this.spinningCraneKickHits += 1;
  }

  get casts() {
    return this.abilityTracker.getAbility(SPELLS.SPINNING_CRANE_KICK.id).casts;
  }

  get totalStacks() {
    let totalStacks = 0;
    this.stackHistory.forEach((e: number, i: number) => {
      totalStacks += e * i;
    });
    return totalStacks;
  }

  get averageStacks() {
    return this.totalStacks / this.casts;
  }

  get averageEnemiesHit() {
    return this.spinningCraneKickHits / (this.casts * 4);
  }

  get dps() {
    return (this.totalDamage / this.owner.fightDuration) * 1000;
  }

  statistic() {
    // Spinning Crane Kick is usually not used outside aoe, so we're avoiding rendering it when it's not used
    if (this.casts > 0) {
      return (
        <Statistic
          position={STATISTIC_ORDER.CORE(7)}
          size="flexible"
          tooltip={<>Total damage increase: {formatNumber(this.totalDamage)}</>}
          dropdown={
            <>
              <table className="table table-condensed">
                <thead>
                  <tr>
                    <th>Stacks</th>
                    <th>Casts</th>
                    <th>Casts (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(this.stackHistory).map((e, i) => (
                    <tr key={i}>
                      <th>{i}</th>
                      <td>{formatNumber(e)}</td>
                      <td>{formatPercentage(e / this.casts)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          }
        >
          <BoringSpellValueText spell={SPELLS.MARK_OF_THE_CRANE}>
            <img src="/img/sword.png" alt="Damage" className="icon" /> {formatNumber(this.dps)} DPS{' '}
            <small>
              {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.totalDamage))} % of
              total
            </small>
            <br />
            {this.averageStacks.toFixed(2)} <small>Average stacks per cast</small>
            <br />
            {this.averageEnemiesHit.toFixed(2)} <small>Average enemies hit per cast</small>
          </BoringSpellValueText>
        </Statistic>
      );
    }
  }
}

export default SpinningCraneKick;
