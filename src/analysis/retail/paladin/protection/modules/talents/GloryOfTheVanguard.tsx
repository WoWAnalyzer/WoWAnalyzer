import SPELLS from 'common/SPELLS/paladin';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  FightEndEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';

const BUFFER_MS = 100;

interface Removal {
  timestamp: number;
  count: number;
  sawWings: boolean;
}

export default class GloryOfTheVanguard extends Analyzer {
  gained = 0;
  used = 0;
  lostInWings = 0;
  lost: { timestamp: number; count: number }[] = [];

  private stacks = 0;
  private sawWings = false;
  private lastAvengersShield = -Infinity;
  private pendingRemoval?: Removal;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(
      TALENTS.GLORY_OF_THE_VANGUARD_1_PROTECTION_TALENT,
    );

    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.VANGUARD_BUFF),
      this.onApply,
    );
    this.addEventListener(
      Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS.VANGUARD_BUFF),
      this.onApplyStack,
    );
    this.addEventListener(
      Events.removebuffstack.to(SELECTED_PLAYER).spell(SPELLS.VANGUARD_BUFF),
      this.onRemoveStack,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.VANGUARD_BUFF),
      this.onRemove,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.AVENGERS_SHIELD_TALENT),
      this.onAvengersShield,
    );
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell([TALENTS.AVENGING_WRATH_TALENT, SPELLS.SENTINEL]),
      this.onWings,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  get lostCount() {
    return this.lost.reduce((total, lost) => total + lost.count, 0);
  }

  private get inWings() {
    return (
      this.selectedCombatant.hasBuff(TALENTS.AVENGING_WRATH_TALENT.id) ||
      this.selectedCombatant.hasBuff(SPELLS.SENTINEL.id)
    );
  }

  private onApply(event: ApplyBuffEvent) {
    this.resolvePendingRemoval(event.timestamp);
    this.gained += 1;
    this.stacks = 1;
    this.sawWings = this.inWings;
  }

  private onApplyStack(event: ApplyBuffStackEvent) {
    this.resolvePendingRemoval(event.timestamp);
    this.gained += Math.max(0, event.stack - this.stacks);
    this.stacks = event.stack;
  }

  private onRemoveStack(event: RemoveBuffStackEvent) {
    this.resolvePendingRemoval(event.timestamp);
    this.used += Math.max(0, this.stacks - event.stack);
    this.stacks = event.stack;
  }

  private onRemove(event: RemoveBuffEvent) {
    this.resolvePendingRemoval(event.timestamp);
    const removal = {
      timestamp: event.timestamp,
      count: this.stacks,
      sawWings: this.sawWings || this.inWings,
    };
    this.stacks = 0;
    if (removal.count === 0) {
      return;
    }
    if (event.timestamp - this.lastAvengersShield <= BUFFER_MS) {
      this.used += 1;
      this.recordLost({ ...removal, count: removal.count - 1 });
    } else {
      this.pendingRemoval = removal;
    }
  }

  private onAvengersShield(event: CastEvent) {
    this.lastAvengersShield = event.timestamp;
    if (this.pendingRemoval && event.timestamp - this.pendingRemoval.timestamp <= BUFFER_MS) {
      this.used += 1;
      this.recordLost({ ...this.pendingRemoval, count: this.pendingRemoval.count - 1 });
      this.pendingRemoval = undefined;
    }
  }

  private onWings() {
    this.sawWings = true;
  }

  private onFightEnd(event: FightEndEvent) {
    this.resolvePendingRemoval(event.timestamp);
    this.pendingRemoval = undefined;
  }

  private resolvePendingRemoval(timestamp: number) {
    if (!this.pendingRemoval || timestamp - this.pendingRemoval.timestamp <= BUFFER_MS) {
      return;
    }
    this.recordLost(this.pendingRemoval);
    this.pendingRemoval = undefined;
  }

  private recordLost({ timestamp, count, sawWings }: Removal) {
    if (count <= 0) {
      return;
    }
    if (sawWings) {
      this.lostInWings += count;
    } else {
      this.lost.push({ timestamp, count });
    }
  }
}
