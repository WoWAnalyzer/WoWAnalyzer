import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import conduitScaling from 'parser/core/conduitScaling';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { ApplyDebuffEvent, CastEvent, DamageEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import StatTracker from 'parser/shared/modules/StatTracker';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

const MARK_OF_THE_CRANE_DURATION = 20000;
const MAX_STACKS = 5;
const MARKING_SPELLS = [
  SPELLS.TIGER_PALM,
  SPELLS.BLACKOUT_KICK,
  TALENTS_MONK.RISING_SUN_KICK_TALENT,
  SPELLS.FIST_OF_THE_WHITE_TIGER_TALENT,
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

class CalculatedStrikes extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    statTracker: StatTracker,
  };

  CS_MOD = 0;

  protected abilityTracker!: AbilityTracker;
  protected statTracker!: StatTracker;

  constructor(options: Options) {
    super(options);

    const conduitRank = 0;
    if (!conduitRank) {
      this.active = false;
      return;
    }

    this.CS_MOD = conduitScaling(0.1, conduitRank);
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
  }

  cycloneStrikesMarks: MarkOfTheCrane[] = [];
  totalDamage = 0;
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
    const mod = this._verifyCurrentStacks(this.cycloneStrikesMarks.length) * this.CS_MOD;
    const increase = calculateEffectiveDamage(event, mod);
    this.totalDamage += increase;
  }

  statistic() {
    // Spinning Crane Kick is usually not used outside aoe, so we're avoiding rendering it when it's not used
    if (this.totalDamage > 0) {
      return (
        <Statistic
          position={STATISTIC_ORDER.OPTIONAL(13)}
          size="flexible"
          category={STATISTIC_CATEGORY.COVENANTS}
          tooltip={
            <>
              The {formatPercentage(this.CS_MOD)}% increase from Calculated Strikes was worth ~
              {formatNumber(this.totalDamage)} raw Damage.
            </>
          }
        >
          <BoringSpellValueText spellId={SPELLS.CALCULATED_STRIKES.id}>
            <ItemDamageDone amount={this.totalDamage} />
          </BoringSpellValueText>
        </Statistic>
      );
    }
  }
}

export default CalculatedStrikes;
